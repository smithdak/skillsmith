#!/usr/bin/env python3
"""A/B test statistics: sample-size design and two-proportion analysis.

stdlib-only; no network. Two modes:

  design:  baseline rate + minimum detectable effect -> required n per variant
  analyze: counts per variant -> z-test, p-value, CI, verdict

Examples:
  experiment_stats.py design --baseline 0.071 --mde 0.15 --mde-type relative
  experiment_stats.py analyze --control-n 4200 --control-x 320 --variant-n 4150 --variant-x 381
"""
import argparse
import json
import math
import sys

DEFAULT_POWER = 0.80
DEFAULT_ALPHA = 0.05


def norm_cdf(x: float) -> float:
    return 0.5 * (1.0 + math.erf(x / math.sqrt(2.0)))


def norm_quantile(p: float) -> float:
    lo, hi = -10.0, 10.0
    for _ in range(200):
        mid = (lo + hi) / 2.0
        if norm_cdf(mid) < p:
            lo = mid
        else:
            hi = mid
    return (lo + hi) / 2.0


def required_n_per_variant(p_baseline: float, mde_abs: float, power: float, alpha: float) -> int:
    p2 = p_baseline + mde_abs
    p_bar = (p_baseline + p2) / 2.0
    z_alpha = norm_quantile(1.0 - alpha / 2.0)
    z_beta = norm_quantile(power)
    var0 = 2.0 * p_bar * (1.0 - p_bar)
    var1 = p_baseline * (1.0 - p_baseline) + p2 * (1.0 - p2)
    n = ((z_alpha * math.sqrt(var0) + z_beta * math.sqrt(var1)) ** 2) / (mde_abs ** 2)
    return math.ceil(n)


def cmd_design(args: argparse.Namespace) -> int:
    if not 0.0 < args.baseline < 1.0:
        print(json.dumps({"error": "--baseline must be between 0 and 1"}))
        return 2
    mde = args.mde * args.baseline if args.mde_type == "relative" else args.mde
    p2 = args.baseline + mde
    if not 0.0 < p2 < 1.0:
        print(json.dumps({"error": "baseline + MDE leaves the valid rate range; shrink the MDE"}))
        return 2
    n = required_n_per_variant(args.baseline, mde, args.power, args.alpha)
    out = {
        "mode": "design",
        "baseline": args.baseline,
        "expected_variant_rate": round(p2, 6),
        "mde_absolute": round(mde, 6),
        "power": args.power,
        "alpha": args.alpha,
        "required_n_per_variant": n,
        "total_required_n": n * 2,
    }
    if args.daily_traffic:
        days = math.ceil((n * 2) / args.daily_traffic)
        out["estimated_days_at_daily_traffic"] = days
        out["runtime_warning"] = (
            f"{days} days exceeds 4 weeks; long tests accumulate time-series confounds"
            if days > 28 else None
        )
    out = {k: v for k, v in out.items() if v is not None}
    print(json.dumps(out, indent=2))
    return 0


def cmd_analyze(args: argparse.Namespace) -> int:
    for name in ("control_n", "variant_n"):
        if getattr(args, name) <= 0:
            print(json.dumps({"error": f"--{name.replace('_', '-')} must be positive"}))
            return 2
    p_c = args.control_x / args.control_n
    p_v = args.variant_x / args.variant_n
    diff = p_v - p_c
    rel = diff / p_c if p_c > 0 else float("nan")
    p_bar = (args.control_x + args.variant_x) / (args.control_n + args.variant_n)
    se = math.sqrt(p_bar * (1.0 - p_bar) * (1.0 / args.control_n + 1.0 / args.variant_n))
    if se == 0:
        print(json.dumps({"error": "zero variance: all outcomes identical, test cannot be judged"}))
        return 2
    z = diff / se
    p_value = 2.0 * (1.0 - norm_cdf(abs(z)))
    z_crit = norm_quantile(1.0 - args.alpha / 2.0)
    ci_lo = diff - z_crit * se
    ci_hi = diff + z_crit * se
    significant = p_value < args.alpha
    direction = "variant wins" if diff > 0 else "control wins"
    verdict = (
        f"{direction} at alpha={args.alpha} ({'significant' if significant else 'not significant'}); "
        f"absolute {diff:+.4f}, relative {rel:+.1%}; "
        f"95% CI [{ci_lo:.4f}, {ci_hi:.4f}]"
    )
    out = {
        "mode": "analyze",
        "control_rate": round(p_c, 6),
        "variant_rate": round(p_v, 6),
        "absolute_effect": round(diff, 6),
        "relative_effect": round(rel, 6) if rel == rel else None,
        "z": round(z, 4),
        "p_value": round(p_value, 6),
        "alpha": args.alpha,
        "significant": significant,
        "ci95_on_difference": [round(ci_lo, 6), round(ci_hi, 6)],
        "verdict": verdict,
        "caveats": [
            "guardrail regressions override a primary-metric win",
            "if the test stopped early on a peek, treat the result as directional, not conclusive",
        ],
    }
    out = {k: v for k, v in out.items() if v is not None}
    print(json.dumps(out, indent=2))
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="command", required=True)

    d = sub.add_parser("design")
    d.add_argument("--baseline", type=float, required=True, help="current primary-metric rate, e.g. 0.071")
    d.add_argument("--mde", type=float, required=True, help="minimum detectable effect (see --mde-type)")
    d.add_argument("--mde-type", choices=["relative", "absolute"], default="relative")
    d.add_argument("--power", type=float, default=DEFAULT_POWER)
    d.add_argument("--alpha", type=float, default=DEFAULT_ALPHA)
    d.add_argument("--daily-traffic", type=int, default=0, help="total daily sessions across both variants")
    d.set_defaults(func=cmd_design)

    a = sub.add_parser("analyze")
    a.add_argument("--control-n", type=int, required=True)
    a.add_argument("--control-x", type=int, required=True, help="conversions/successes in control")
    a.add_argument("--variant-n", type=int, required=True)
    a.add_argument("--variant-x", type=int, required=True, help="conversions/successes in variant")
    a.add_argument("--alpha", type=float, default=DEFAULT_ALPHA)
    a.set_defaults(func=cmd_analyze)

    args = parser.parse_args()
    try:
        return args.func(args)
    except BrokenPipeError:
        return 0


if __name__ == "__main__":
    sys.exit(main())
