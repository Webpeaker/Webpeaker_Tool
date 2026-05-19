import { Link } from 'react-router-dom';

export default function ToolCard({ tool }) {
  const Icon = tool.icon;
  
  return (
    <Link 
      to={tool.path} 
      className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center group"
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${tool.bg} ${tool.color} group-hover:scale-110 transition-transform duration-300`}>
        <Icon size={28} />
      </div>
      <h3 className="font-bold text-gray-800 mb-2">{tool.name}</h3>
      <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
        {tool.description}
      </p>
    </Link>
  );
}