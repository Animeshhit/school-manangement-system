"use client";
import {
  LayoutDashboard,
  GitBranch,
  Users,
  GraduationCap,
  ClipboardCheck,
  Receipt,
  Calendar,
  Bell,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Sidebar = () => {
  const pathname = usePathname();
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard',href:"/" },
    { icon: GitBranch, label: 'Branches', href:"/branches" },
    { icon: GraduationCap, label: 'Teachers', href:"/teachers" },
    { icon: Users, label: 'Students', href:"/students" },
    { icon: ClipboardCheck, label: 'Attendance', href:"/attendance" },
    { icon: Receipt, label: 'Fees', href:"/fees" },
    { icon: Calendar, label: 'Routines', href:"/routines" },
    { icon: Bell, label: 'Notices', href:"/notices" },
    { icon: FileText, label: 'Audit Logs', href:"/audit-logs" },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
            <GitBranch className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Ravi's School</h1>
            <p className="text-xs text-gray-500">Admin Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = item.href === pathname;
          return (
            <Link
              href={item.href}
              key={index}
              className={`w-full cursor-pointer flex items-center gap-3 px-4 py-3 mb-1 transition-all ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-linear-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
            SJ
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">Animus bsdk</p>
            <p className="text-xs text-gray-500">Super Admin</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
