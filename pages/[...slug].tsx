import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import Footer from "../components/Footer";
import Header from "../components/Header";
import SquigglyLines from "../components/SquigglyLines";

export const Home: NextPage = () => {
  const router = useRouter();
  const urlState = router.query.slug;
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [curArticle, setCurArticle] = useState<string>("");

  useEffect(() => {
    if (
      urlState &&
      router.isReady &&
      !curArticle &&
      typeof urlState !== "string" &&
      urlState.every((subslug: string) => typeof subslug === "string")
    ) {
      generateSummary(
        "https://techcrunch.com/" + (urlState as string[]).join("/")
      );
    }
  }, [router.isReady, urlState]);

  const curUrl = String(curArticle.split(".com")[1]);

  const generateSummary = async (url?: string) => {
    setSummary("");
    if (url) {
      if (!url.includes("techcrunch.com")) {
        toast.error("Please enter a valid TechCrunch article");
        return;
      }
      setCurArticle(url);
    } else {
      if (!curArticle.includes("techcrunch.com")) {
        toast.error("Please enter a valid TechCrunch article");
        return;
      }
      router.replace(curUrl);
    }
    setLoading(true);
    const response = await fetch(`/api/summarize?url=${encodeURIComponent(url ? url : curArticle)}`);

    if (!response.ok) {
      console.log("error", response.statusText);
      return;
    }

    const data = response.body;
    if (!data) {
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      setSummary((prev) => prev + chunkValue);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col max-w-5xl min-h-screen pt-8 mx-auto sm:pt-12">
      <Head>
        <title>TechCrunch Summarizer</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <main className="flex flex-col justify-center flex-1 max-w-5xl px-2 mx-auto mt-10 sm:mt-40">
        <a
          target="_blank"
          rel="noreferrer"
          className="hidden px-4 py-1 mx-auto mb-5 text-gray-500 transition duration-300 ease-in-out border border-gray-800 rounded-full max-w-fit hover:scale-105 hover:border-gray-700 md:block"
          href="https://twitter.com/nutlope/status/1622988173155368960"
        >
          You can also go to a Techcrunch article and add "summary" after
          "techcrunch" in the URL
        </a>
        <h1 className="max-w-5xl text-4xl font-bold text-center sm:text-7xl">
          Summarize any{" "}
          <span className="relative whitespace-nowrap text-[#3290EE]">
            <SquigglyLines />
            <span className="relative text-green-500">TechCrunch</span>
          </span>{" "}
          article with AI
        </h1>
        <p className="mt-10 text-lg text-center text-gray-500 sm:text-2xl">
          Copy and paste any <span className="text-green-500">TechCrunch </span>
          article link below.
        </p>
        <input
          type="text"
          value={curArticle}
          onChange={(e) => setCurArticle(e.target.value)}
          className="w-full p-3 mx-auto mt-10 bg-black border border-gray-500 rounded-lg outline-1 outline-white sm:mt-7 sm:w-3/4"
        />
        {!loading && (
          <button
            className="z-10 w-3/4 p-3 mx-auto text-lg font-medium transition bg-green-500 border-gray-500 mt-7 rounded-2xl hover:bg-green-400 sm:mt-10 sm:w-1/3"
            onClick={() => generateSummary()}
          >
            Summarize
          </button>
        )}
        {loading && (
          <button
            className="z-10 w-3/4 p-3 mx-auto text-lg font-medium transition bg-green-500 border-gray-500 cursor-not-allowed mt-7 rounded-2xl hover:bg-green-400 sm:mt-10 sm:w-1/3"
            disabled
          >
            <div className="flex items-center justify-center text-white">
              <Image
                src="/loading.svg"
                alt="Loading..."
                width={28}
                height={28}
              />
            </div>
          </button>
        )}
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{ duration: 2000 }}
        />
        {summary && (
          <div className="px-4 mb-10">
            <h2 className="max-w-3xl pt-8 mx-auto mt-16 text-3xl font-bold text-center border-t border-gray-600 sm:text-5xl">
              Summary
            </h2>
            <div className="max-w-3xl mx-auto mt-6 text-lg leading-7">
              {summary.split(". ").map((sentence, index) => (
                <div key={index}>
                  {sentence.length > 0 && (
                    <li className="mb-2 list-disc">{sentence}</li>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Home;
