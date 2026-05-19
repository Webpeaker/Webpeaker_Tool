import { Link } from 'react-router-dom';

export default function ToolCard({ tool }) {
  const Icon = tool.icon;
  
  return (
    <Link 
      to={tool.path} 
      className="group flex min-h-[190px] flex-col items-center rounded-lg border border-gray-100 bg-white p-6 text-center shadow-[0_8px_30px_rgba(17,24,39,0.035)] transition-all duration-300 hover:-translate-y-1 hover:border-webpeaker-100 hover:shadow-[0_18px_45px_rgba(104,50,227,0.12)] dark:border-gray-800 dark:bg-gray-900 dark:shadow-none dark:hover:border-webpeaker-900"
    >
      <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-lg ${tool.bg} ${tool.color} transition-transform duration-300 group-hover:scale-105`}>
        <Icon size={27} strokeWidth={1.9} />
      </div>
      <h3 className="mb-2 text-base font-bold text-gray-950 dark:text-gray-100">{tool.name}</h3>
      <p className="line-clamp-3 text-sm leading-6 text-gray-500 dark:text-gray-400">
        {tool.description}
      </p>
    </Link>
  );
}
