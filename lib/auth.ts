import { supabase } from "@/lib/supabaseClient";

/**
 * ID ログイン用のダミーメールドメイン。
 * Supabase Auth はメールアドレスでログインするため、
 * 画面で入力された ID を `ID@mint.local` に変換して認証する。
 * （アカウント発行時も同じ形式のメールアドレスで作成すること）
 */
export const LOGIN_EMAIL_DOMAIN = "mint.local";

export function idToEmail(id: string): string {
  return `${id.trim().toLowerCase()}@${LOGIN_EMAIL_DOMAIN}`;
}

/** メールアドレスから画面表示用の ID を取り出す */
export function emailToId(email: string | null | undefined): string {
  return (email ?? "").replace(`@${LOGIN_EMAIL_DOMAIN}`, "");
}

/** ID とパスワードでログインする */
export async function signIn(id: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({
    email: idToEmail(id),
    password,
  });
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
