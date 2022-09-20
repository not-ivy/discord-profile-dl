import Head from "next/head";
import { useCallback, useEffect, useRef, useState } from "react"
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

export default function Index() {
  const [lookupResult, setLookupResult] = useState<any | undefined>(undefined);
  const { executeRecaptcha } = useGoogleReCaptcha();
  const inputRef = useRef(null);

  const sendRequest = useCallback(async () => {
    if (!executeRecaptcha) return;
    if (!inputRef) return;
    const token = await executeRecaptcha();
    fetch(`${window.location.href}/requestBulk?${new URLSearchParams({ idList: inputRef.current.value.split(','), captcha: token }).toString()}`)
      .then((res) => res.json)
      .then((data) => setLookupResult(data))
  }, [executeRecaptcha])

  useEffect(() => {
    console.log(lookupResult);
  }, [lookupResult])

  useEffect(() => {
    sendRequest();
  }, [sendRequest]);

  return (
    <>
      <Head>
        <title>Lookup multiple discord users</title>
      </Head>
      <div className="max-w-screen-md mx-auto p-4 lg:p-8 bg-white dark:bg-black text-black dark:text-white">
        <h2 className="mb-4 text-3xl font-bold italic">Input ID here:</h2>
        <textarea className="m-2 p-2 outline-dashed w-full dark:bg-black text-black dark:text-white dark:border-white border-black" ref={inputRef} placeholder="List of Discord IDs seperated by comma with no space" /> <br />
        <button className="m-2 p-2 transition-colors dark:border-white border-black dark:hover:bg-white dark:hover:text-black dark:hover:border-black cursor-pointer outline-dashed font-bold" onClick={sendRequest}>Submit</button>
      </div>
    </>
  )
}
