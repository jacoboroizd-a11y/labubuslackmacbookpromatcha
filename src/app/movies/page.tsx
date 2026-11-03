import Discover from "../discover/page";
export const metadata = { title: "Películas" };
export default function Movies(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <Discover {...props} kind="movie" />;
}
