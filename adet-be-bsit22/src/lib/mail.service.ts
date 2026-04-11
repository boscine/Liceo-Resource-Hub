/**
 * Institutional Mail Service - Dev-Log Edition
 * This service dispatches scholarly access codes to the system console for development archival,
 * bypassing external vendor restrictions in the sandbox environment.
 */

export const sendOTPEmail = async (email: string, code: string) => {
  // Institutional Dev-Log: Discharging the access code to the console for scholarly verification
  console.log(`\n============== [SCHOLARLY DISPATCH: OTP] ==============`);
  console.log(`TARGET: ${email}`);
  console.log(`CODE  : ${code}`);
  console.log(`STATUS: DISPATCHED TO CONSOLE (DEV-MODE)`);
  console.log(`=======================================================\n`);

  return { success: true, id: 'dev-mode-dispatch-' + Date.now() };
};

export const sendPasswordResetEmail = async (email: string, code: string) => {
  // Institutional Dev-Log: Discharging the restoration code to the console for archival recovery
  console.log(`\n=========== [SCHOLARLY DISPATCH: RESTORE] ===========`);
  console.log(`TARGET: ${email}`);
  console.log(`CODE  : ${code}`);
  console.log(`STATUS: DISPATCHED TO CONSOLE (DEV-MODE)`);
  console.log(`=====================================================\n`);

  return { success: true, id: 'dev-mode-restore-' + Date.now() };
};
