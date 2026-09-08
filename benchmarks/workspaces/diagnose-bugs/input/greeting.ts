type User = { name: string };
let activeTenant = "";

export async function greet(
  tenant: string,
  userId: string,
  loadUser: (id: string) => Promise<User>,
): Promise<string> {
  activeTenant = tenant;
  const user = await loadUser(userId);
  return `${activeTenant}: hello ${user.name}`;
}
