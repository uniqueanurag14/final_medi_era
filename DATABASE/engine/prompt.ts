import readline from 'readline';

/**
 * Prompts user for a yes/no confirmation via CLI
 * Returns true strictly if user enters 'yes' or 'y' (case-insensitive)
 */
export function askConfirmation(promptText: string): Promise<boolean> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(promptText, (answer) => {
      rl.close();
      const trimmed = answer.trim().toLowerCase();
      resolve(trimmed === 'yes' || trimmed === 'y');
    });
  });
}

/**
 * Prompts user to type an exact phrase for dangerous confirmation actions
 */
export function askExactPhrase(promptText: string, expectedPhrase: string): Promise<boolean> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(promptText, (answer) => {
      rl.close();
      resolve(answer.trim() === expectedPhrase.trim());
    });
  });
}
