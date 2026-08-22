#!/usr/bin/env python3
"""
Start one or more local dev servers, wait until each port accepts connections,
run a command, then stop every server (whole process tree) no matter how the
command ends. Adapted from anthropics/skills — webapp-testing (Apache-2.0);
see repo-root NOTICES.md.

Usage:
    # Single server
    python with_server.py --server "npm run dev" --port 5173 -- python automation.py

    # Multiple servers (order matters: each is started and awaited in turn)
    python with_server.py \
      --server "cd backend && python server.py" --port 3000 \
      --server "cd frontend && npm run dev" --port 5173 \
      -- python test.py

Server output goes to a log file per server (paths are printed); the tail of
the log is shown when a server fails to come up. Read-only apart from those
logs; the only connections made are readiness probes to --host on the given
ports.
"""

import argparse
import os
import signal
import socket
import subprocess
import sys
import tempfile
import time

IS_WINDOWS = os.name == "nt"


def port_open(host, port):
    try:
        with socket.create_connection((host, port), timeout=1):
            return True
    except OSError:
        return False


def wait_for_port(process, host, port, timeout):
    """True once the port accepts a connection; False on timeout or early exit."""
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        if port_open(host, port):
            return True
        if process.poll() is not None:
            return False
        time.sleep(0.5)
    return False


def start_server(cmd, log_path):
    log = open(log_path, "wb")
    kwargs = {"shell": True, "stdout": log, "stderr": subprocess.STDOUT}
    if IS_WINDOWS:
        kwargs["creationflags"] = subprocess.CREATE_NEW_PROCESS_GROUP
    else:
        kwargs["start_new_session"] = True
    process = subprocess.Popen(cmd, **kwargs)
    process.log_handle = log
    return process


def stop_server(process):
    """Terminate the server and everything it spawned, then wait for exit."""
    if process.poll() is None:
        if IS_WINDOWS:
            subprocess.run(
                ["taskkill", "/T", "/F", "/PID", str(process.pid)],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                check=False,
            )
        else:
            try:
                os.killpg(os.getpgid(process.pid), signal.SIGTERM)
            except ProcessLookupError:
                pass
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            if not IS_WINDOWS:
                try:
                    os.killpg(os.getpgid(process.pid), signal.SIGKILL)
                except ProcessLookupError:
                    pass
            process.wait()
    process.log_handle.close()


def tail(path, lines=30):
    try:
        with open(path, "rb") as f:
            return b"".join(f.readlines()[-lines:]).decode("utf-8", "replace")
    except OSError:
        return ""


def main():
    parser = argparse.ArgumentParser(
        description="Run a command with one or more local servers up, then stop them.",
    )
    parser.add_argument("--server", action="append", dest="servers", required=True,
                        help="server command (repeatable; one --port per --server)")
    parser.add_argument("--port", action="append", dest="ports", type=int, required=True,
                        help="port the matching --server listens on")
    parser.add_argument("--host", default="127.0.0.1",
                        help="host to probe for readiness (default: 127.0.0.1)")
    parser.add_argument("--timeout", type=int, default=30,
                        help="seconds to wait per server (default: 30)")
    parser.add_argument("command", nargs=argparse.REMAINDER,
                        help="command to run once every server is ready (after --)")
    args = parser.parse_args()

    command = args.command[1:] if args.command and args.command[0] == "--" else args.command
    if not command:
        parser.error("no command to run — put it after --")
    if len(args.servers) != len(args.ports):
        parser.error("each --server needs exactly one --port")

    log_dir = tempfile.mkdtemp(prefix="with_server_")
    processes = []
    try:
        for i, (cmd, port) in enumerate(zip(args.servers, args.ports), start=1):
            if port_open(args.host, port):
                print(f"error: something already listens on {args.host}:{port}; "
                      f"use the running server instead of starting another", file=sys.stderr)
                sys.exit(2)
            log_path = os.path.join(log_dir, f"server-{i}.log")
            print(f"[{i}/{len(args.servers)}] starting: {cmd}  (log: {log_path})")
            process = start_server(cmd, log_path)
            processes.append(process)
            if not wait_for_port(process, args.host, port, args.timeout):
                reason = ("exited early" if process.poll() is not None
                          else f"did not open {args.host}:{port} within {args.timeout}s")
                print(f"error: server {i} {reason}\n--- last lines of {log_path} ---\n{tail(log_path)}",
                      file=sys.stderr)
                sys.exit(1)
            print(f"[{i}/{len(args.servers)}] ready on {args.host}:{port}")

        print(f"running: {' '.join(command)}\n", flush=True)
        sys.exit(subprocess.run(command).returncode)
    finally:
        for i, process in enumerate(processes, start=1):
            stop_server(process)
            print(f"server {i} stopped")


if __name__ == "__main__":
    main()
