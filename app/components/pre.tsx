import { useCallback, type PropsWithChildren } from "react";
import { Button } from "./ui/button";

type PreProps = PropsWithChildren<{ code: string; language?: string }>;

export default function Pre({
  children,
  code,
  language = "",
  ...other
}: PreProps) {
  const copyHandler = useCallback(() => {
    navigator.clipboard.writeText(code);
  }, [code]);
  return (
    <pre {...other}>
      <div className="border-b h-8 flex bg-muted items-center justify-between">
        <span className="text-muted-foreground text-sm pl-4">{language}</span>
        <Button
          variant="link"
          className="text-muted-foreground text-sm hover:hover:no-underline p-0 pr-4 h-fit"
          onClick={copyHandler}
        >
          copy
        </Button>
      </div>
      {children}
    </pre>
  );
}
