import JSZip from "jszip";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useRef, useState } from "react"
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import type { DiscordResponse, DiscordUser, Status } from "../types/discord";

export default function Index() {
  const [lookupResult, setLookupResult] = useState<DiscordUser[] | undefined>(undefined);
  const [failedRequests, setFailedRequests] = useState<{ status: Status, response: DiscordResponse }[] | undefined>(undefined);
  const [formError, setFormError] = useState(false);
  const [imgList, setImgList] = useState<Map<string, Blob> | undefined>(undefined);
  const { executeRecaptcha } = useGoogleReCaptcha();
  const inputRef = useRef(null);

  const sendRequest = async () => {
    if (!executeRecaptcha) return;
    if (!inputRef || !inputRef.current.value) { setFormError(true); return }
    const token = await executeRecaptcha();
    fetch(`${window.location.href}/api/requestBulk`, {
      method: 'POST',
      body: JSON.stringify({
        idList: inputRef.current.value.split('\n'),
        captcha: token
      })
    })
      .then((res) => res.json())
      .then((data: DiscordUser | DiscordUser[]) => {
        if (!Array.isArray(data)) { setLookupResult([data]); return }
        setLookupResult(data);
      })
  }

  useEffect(() => {
    if (!lookupResult) return;
    let tempfail: { status: Status, response: DiscordResponse }[] = [];
    lookupResult.forEach((result) => { if (!result.status.success) tempfail.push({ status: result.status, response: result.response }) })
    setFailedRequests(tempfail);
  }, [lookupResult])

  useEffect(() => {
    const zipAllImages = async () => {
      let tempList: Map<string, Blob> = new Map();
      if (!lookupResult) return;
      const successResults = lookupResult.filter((it) => it.status.success).map((it) => it.response);
      for (const it of successResults) {
        const blob = await (await fetch(`https://cdn.discordapp.com/avatars/${it.id}/${it.avatar}.jpg?size=1024`)).blob()
        tempList.set(`${it.username}#${it.discriminator}`, blob)
      }
      console.log(tempList)
      setImgList(tempList);
    }
    zipAllImages();
  }, [lookupResult]);

  const inputCallback = () => {
    if (formError) { setFormError(false); return }
  }

  const download = async () => {
    if (!imgList) return;
    const images = new JSZip().folder(Date.now().toString());
    imgList.forEach((value, key) => { images.file(`${key}.jpg`, value) });
    const zip = await images.generateAsync({ type: 'blob' });
    window.open(URL.createObjectURL(zip), '_blank');
  }

  return (
    <>
      <Head>
        <title>Download discord user&apos;s profile</title>
      </Head>
      <div className="max-w-screen-md mx-auto p-4 lg:p-8 bg-white dark:bg-black text-black dark:text-white">
        <div className={`my-2 p-2 outline-dashed outline-red-600 flex justify-center items-center ${failedRequests ? 'block' : 'hidden'} dark:text-white text-black font-medium italic bg-red-800`}>
          {failedRequests ? failedRequests.map((failed, index) => (
            <div key={`error-${index}`}>
              <span>Some requests failed with reason {failed.status.error}</span>
              <details>
                <summary>Show discord response:</summary>
                <pre className="whitespace-pre-wrap">{JSON.stringify(failed.response.errors, null, 2)}</pre>
              </details>
            </div>
          )) : <></>}
        </div>
        <h2 className="my-4 text-3xl font-bold italic">Input IDs here:</h2>
        <textarea onInput={inputCallback} className={`my-2 p-2 font-medium outline-dashed w-full dark:bg-black text-black dark:text-white ${formError ? 'dark:outline-red-500 outline-red-500 text-red-500 dark:text-red-500' : ''} dark:outline-white outline-black transition-all`} ref={inputRef} placeholder="List of Discord IDs seperated by newline" /> <br />
        <button className="mt-2 p-2 transition-colors dark:outline-white outline-black dark:hover:bg-white dark:hover:text-black dark:hover:border-black cursor-pointer outline-dashed font-bold" onClick={sendRequest}>Submit</button>
        {!lookupResult ? <></> : lookupResult.map((user) => (
          <>
            <hr className="my-8 border-none outline-dashed dark:outline-white outline-black" />
            <div className={`${!user.status.success ? 'hidden' : 'grid'} grid-cols-5 gap-x-4 p-4 grid-rows-3 w-full h-40 my-4 outline-dashed dark:outline-white outline-black`} key={`user-${user.response.id}`}>
              <div className="col-span-1 row-span-3 relative">
                <Image className="rounded-full" alt={user.response.username} src={`https://cdn.discordapp.com/avatars/${user.response.id}/${user.response.avatar}.webp?size=1024`} layout="fill" objectFit="contain" />
              </div>
              <div className="flex flex-col justify-center items-center col-span-4 row-span-3">
                {!user.response.banner ? <></> : (
                  <div className="relative w-full h-full">
                    <Image src={`https://cdn.discordapp.com/banners/${user.response.id}/${user.response.banner}.webp?size=1024`} alt={`${user.response.username}'s banner`} layout="fill" objectFit="contain" />
                  </div>
                )}
                <span>{user.response.username}#{user.response.discriminator}</span>
              </div>
            </div>
          </>
        ))}
        {!lookupResult ? <></> : (
          <>
            <hr className="my-8 border-none outline-dashed dark:outline-white outline-black" />
            <button className="p-2 transition-colors dark:outline-white outline-black dark:hover:bg-white dark:hover:text-black dark:hover:border-black cursor-pointer outline-dashed font-bold" onClick={download}>Download</button>
          </>
        )}
      </div>
    </>
  )
}
