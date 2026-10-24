export function getUsernameError(message: string): string {
  if (message.includes("longer than or equal to 3")) {
    return "Username must be at least 3 characters long.";
  }

  if (message.includes("should not be empty")) {
    return "Please enter a username.";
  }

  return message;
}