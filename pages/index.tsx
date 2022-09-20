import Head from "next/head";
import Image from "next/image";
import { useEffect, useRef, useState } from "react"
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import type DiscordUser from "../types/discord";

export default function Index() {
  const [lookupResult, setLookupResult] = useState<DiscordUser | undefined>(undefined);
  const [formError, setFormError] = useState(false);
  const { executeRecaptcha } = useGoogleReCaptcha();
  const inputRef = useRef(null);

  const sendRequest = async () => {
    if (!executeRecaptcha) return;
    if (!inputRef || !inputRef.current.value) { setFormError(true); return }
    console.log(!inputRef.current.value);
    const token = await executeRecaptcha();
    fetch(`${window.location.href}/api/requestBulk?${new URLSearchParams({ idList: inputRef.current.value.split(','), captcha: token }).toString()}`)
      .then((res) => res.json())
      .then((data: DiscordUser) => setLookupResult(data))
  }

  useEffect(() => {
    console.log(lookupResult);
  }, [lookupResult])

  const inputCallback = () => {
    if (formError) { setFormError(false); return }
  }

  return (
    <>
      <Head>
        <title>Lookup multiple discord users</title>
      </Head>
      <div className="max-w-screen-md mx-auto p-4 lg:p-8 bg-white dark:bg-black text-black dark:text-white">
        <h2 className="mb-4 text-3xl font-bold italic">Input ID here:</h2>
        <textarea onInput={inputCallback} className={`m-2 p-2 font-medium outline-dashed w-full dark:bg-black text-black dark:text-white ${formError ? 'dark:outline-red-500 outline-red-500 text-red-500 dark:text-red-500' : ''} dark:outline-white outline-black transition-all`} ref={inputRef} placeholder="List of Discord IDs seperated by space" /> <br />
        <button className="m-2 p-2 transition-colors dark:outline-white outline-black dark:hover:bg-white dark:hover:text-black dark:hover:border-black cursor-pointer outline-dashed font-bold" onClick={sendRequest}>Submit</button>
        <div>{JSON.stringify(lookupResult)}</div>
      </div>
    </>
  )
}
