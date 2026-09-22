import { redirect } from 'next/navigation';

export default function ReturnsRedirect() {
  redirect('/orders?tab=returns');
}
