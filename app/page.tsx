type CardProps = {
  title: string;
  content: string;
};
export default function Home() {
  return (
    <div className="flex w-full">
      <div className="w-1/2 flex flex-col items-center justify-center gap-2">
        <input type="text" placeholder="create title" className="bg-slate-800"/>
        <input type="text" placeholder="create descr" className="bg-slate-800"/>
        <button className="bg-red-900 w-20">create</button>
      </div>
      <div className="w-full flex items-center justify-center p-10">
        <div>
          <input type="text" className="bg-red-900 px-1 mb-3" />
          <button className="ml-5 bg-slate-700 w-40">search</button>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <Card title="asd" content="asd" />
            <Card title="asd" content="asd" />
            <Card title="asd" content="asd" />
            <Card title="asd" content="asd" />
          </div>
        </div>
      </div>
    </div>
  );
}

async function Card({ title, content }: CardProps){
  return <div className="h-50 w-50 bg-red-900 ">
    <div className="">
        title : {title}
        <br />
        content : {content}
    </div>
  </div>
}