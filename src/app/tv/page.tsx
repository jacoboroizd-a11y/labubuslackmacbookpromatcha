import Discover from "../discover/page";
export const metadata = { title: "Series" };
export default function TV(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <Discover {...props} kind="tv" />;
}
