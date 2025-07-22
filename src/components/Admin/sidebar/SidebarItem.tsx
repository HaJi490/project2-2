import React, { useContext, useState } from 'react'
import { SidebarContext } from './Sidebar';
import { useRouter } from 'next/navigation';

export default function SidebarItem({item} : {item: any}) {
    const {expanded} = useContext(SidebarContext);
    const [submenuOpen, setSubmenuOpen] = useState(false);
    const route = useRouter();
    
  return (
    <li className='relative flex items-center py-3 px-3 my-1
                font-medium rounded-md cursor-pointer
                transition-colors group
                hover:bg-indigo-50 text-gray-600'>
        {item.icon}
        <span className={`overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"}`}
                onClick={() => route.push(item.path)}>
            {item.name}
        </span>

        {/* 접힌 상태일 때의 툴팁 */}
        {!expanded && (
            <div className={`
                absolute left-full rounded-md px-3 py-3 ml-6
                bg-indigo-100 text-indigo-800 text-sm
                invisible opacity-20 -translate-x-3 transition-all
                group-hover:visible group-hover:opacity-100 group-hover:translate-x-0
            `}>
                {item.name}
            </div>
        )}
    </li>
  )
}
