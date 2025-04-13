import { signIn } from "@/app/_components/sidebar/sign-in-action";

export default function SignIn() {
  return (
    <form action={signIn}>
      <button type="submit">Signin with Google</button>
    </form>
  );
}
