import { cn } from "~/lib/utils";
// import posts from "../../tools/posts.json";

interface SidebarProps {
  className?: string;
}
export default function Sidebar(props: SidebarProps) {
  return (
    <div className={cn("pb-12", props.className)}>
      hello, i am cuitao. hello world!
    </div>
  );
}
