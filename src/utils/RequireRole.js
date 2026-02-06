export default function RequireRole(requiredRoles) {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) return window.location.href = "/login";

  if (!requiredRoles.includes(user.role))
    return window.location.href = "/forbidden"; 

  return true;
}
