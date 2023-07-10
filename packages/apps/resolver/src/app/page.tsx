"use client";

import { ChangeEventHandler, useCallback, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";

import { GITHUB_URL } from "@xcpcio/types";

import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useLoadBoardData } from "@/lib/local-storage";

export default function Home() {
  const { toast } = useToast();

  const [textValue, setTextValue] = useState("");

  const [, setBoardData] = useLoadBoardData();

  const handleTextareaChange: ChangeEventHandler<HTMLTextAreaElement> = useCallback(
    (event) => {
      setTextValue(event.target.value);
    },
    [setTextValue],
  );

  const handleLoadData = useCallback(async () => {
    setBoardData(textValue);

    toast({
      title: "Load Data",
      description: `Success. [length=${textValue.length}]`,
    });
  }, [textValue, setBoardData, toast]);

  const handleLoadExampleData = useCallback(async () => {
    const resp = await fetch("/api/load-data");
    const toastTitle = "Load Example Data";

    if (resp.status === 200) {
      const text = await resp.text();
      setBoardData(text);

      toast({
        title: toastTitle,
        description: `Success. [data=2023-ccpc-final] [length=${text.length}]`,
      });
    } else {
      toast({
        title: toastTitle,
        description: `Failed. [data=2023-ccpc-final] [status=${resp.statusText}]`,
      });
    }
  }, [setBoardData, toast]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Resolver For ICPC/CCPC
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon icon="octicon:mark-github-16" width={36} />
          </a>
        </div>
      </div>

      <div className="flex w-2/5">
        <Textarea rows={16} value={textValue} onChange={handleTextareaChange} />
      </div>

      <div className="mb-32 grid text-center lg:mb-0 lg:grid-cols-4 lg:text-left">
        <a
          href={GITHUB_URL}
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Docs{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}></p>
        </a>

        <div
          onClick={handleLoadData}
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30 cursor-pointer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Load data{" "}
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>Loading data from the textarea above.</p>
        </div>

        <div
          onClick={handleLoadExampleData}
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30 cursor-pointer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>Load example data </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>Loading data for the 2023 CCPC Final.</p>
        </div>

        <Link
          href={"/resolver"}
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Enter{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}></p>
        </Link>
      </div>
    </main>
  );
}
