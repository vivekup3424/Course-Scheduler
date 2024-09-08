export const saveToken = (token: string) =>
  void localStorage.setItem("token", token);
