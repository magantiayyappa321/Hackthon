export function getRegisteredAccounts() {
  const storedAccounts = JSON.parse(
    localStorage.getItem("weather_accounts") || "[]"
  );
  const accounts = Array.isArray(storedAccounts) ? [...storedAccounts] : [];

  ["user", "admin"].forEach((role) => {
    const legacyAccount = JSON.parse(
      localStorage.getItem(`weather_${role}`) || "null"
    );

    if (
      legacyAccount &&
      !accounts.some(
        (account) =>
          account.role === legacyAccount.role &&
          account.email === legacyAccount.email
      )
    ) {
      accounts.push(legacyAccount);
    }
  });

  return accounts;
}

export function saveAccount(account) {
  const accounts = getRegisteredAccounts();
  const existingIndex = accounts.findIndex(
    (saved) => saved.role === account.role && saved.email === account.email
  );

  if (existingIndex === -1) {
    accounts.push(account);
  } else {
    accounts[existingIndex] = account;
  }

  localStorage.setItem("weather_accounts", JSON.stringify(accounts));
  localStorage.setItem(`weather_${account.role}`, JSON.stringify(account));
}

export function removeAccount(account) {
  const accounts = getRegisteredAccounts().filter(
    (saved) => !(saved.role === account.role && saved.email === account.email)
  );

  localStorage.setItem("weather_accounts", JSON.stringify(accounts));

  const legacyAccount = JSON.parse(
    localStorage.getItem(`weather_${account.role}`) || "null"
  );
  if (legacyAccount?.email === account.email) {
    localStorage.removeItem(`weather_${account.role}`);
  }
}
