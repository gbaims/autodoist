type AppConfig = {
  todoist: {
    clientSecret: string;
  };
};

function loadConfig(): AppConfig {
  const clientSecret = Deno.env.get("TODOIST_CLIENT_SECRET");

  if (!clientSecret) {
    throw new Error("TODOIST_CLIENT_SECRET is required");
  }

  return {
    todoist: {
      clientSecret,
    },
  };
}

export type { AppConfig };
export { loadConfig };
