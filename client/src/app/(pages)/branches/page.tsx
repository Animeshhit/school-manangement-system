"use client";

import {
  BarChart2,
  Building2,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Pencil,
  PlusIcon,
  SlidersHorizontalIcon,
  Trash2,
} from "lucide-react";
import { TrendUpIcon, WarningIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Branch data
const branchData = [
  {
    id: "BR-0012",
    name: "Oakwood Secondary Academy",
    address: "122 North Broadway, Manhattan, NY",
    contactAvatar: "/contact-avatar.png",
    contactName: "David Richards",
    contactRole: "Principal",
    teachers: 45,
    students: 1240,
    status: "Active",
    opacity: false,
  },
  {
    id: "BR-0045",
    name: "Pine Valley Elementary",
    address: "45 Valley View Road, Queens, NY",
    contactAvatar: "/contact-avatar-1.png",
    contactName: "Elena Gilbert",
    contactRole: "Administrator",
    teachers: 32,
    students: 650,
    status: "Active",
    opacity: false,
  },
  {
    id: "BR-0092",
    name: "Lakeside Vocational Center",
    address: "202 Marina Bay Blvd, Brooklyn, NY",
    contactAvatar: "/contact-avatar-2.png",
    contactName: "Marcus Webb",
    contactRole: "Director",
    teachers: 12,
    students: 185,
    status: "Inactive",
    opacity: true,
  },
  {
    id: "BR-0128",
    name: "Summit Hills Primary",
    address: "78 Summit Circle, Staten Island, NY",
    contactAvatar: "/background-3.svg",
    contactName: "Tanya Morse",
    contactRole: "Registrar",
    teachers: 24,
    students: 412,
    status: "Active",
    opacity: false,
  },
];

export default function BranchManagementDashboardSection() {
  const [activePage, setActivePage] = useState(1);
  const totalBranches = 24;
  const perPage = 4;
  const totalPages = Math.ceil(totalBranches / perPage);

  const handleDelete = (id: string) => {
    console.log("Delete branch:", id);
  };

  const handleEdit = (id: string) => {
    console.log("Edit branch:", id);
  };

  const handleStats = (id: string) => {
    console.log("View stats for branch:", id);
  };

  return (
    <div className="flex flex-col items-start gap-6 pt-12 pb-12 px-8 container mx-auto self-stretch w-full">
      {/* Header */}
      <div className="flex items-end justify-between self-stretch w-full">
        <div className="flex flex-col items-start gap-1">
          <h1 className=" font-bold text-[#191c1e] text-3xl tracking-[-0.75px] leading-9 whitespace-nowrap">
            Branch Management
          </h1>
          <p className=" font-normal text-[#464555] text-base tracking-[0] leading-6 whitespace-nowrap">
            Manage and monitor school branches across all regions.
          </p>
        </div>

        {/* Create Branch Button */}
        <div className="relative inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[linear-gradient(166deg,rgba(79,70,229,1)_0%,rgba(53,37,205,1)_100%)] cursor-pointer">
          <div className="absolute inset-0 bg-[#ffffff01] rounded-xl shadow-[0px_4px_6px_-4px_#3525cd33,0px_10px_15px_-3px_#3525cd33]" />
          <PlusIcon className="relative w-5 h-5 text-white shrink-0" />
          <span className="relative  font-normal text-white text-base text-center tracking-[0] leading-6 whitespace-nowrap">
            Create Branch
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-6 w-full py-2">
        {/* Total Branches */}
        <Card className="p-6 bg-white rounded-3xl border border-transparent shadow-sm">
          <CardContent className="p-0 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-blue-500 rounded-md p-3">
                <Building2 color="white" />
              </div>
              <div className="flex flex-col items-start">
                <span className=" font-normal text-[#464555] text-sm tracking-[0] leading-5 whitespace-nowrap">
                  Total Branches
                </span>
                <span className=" font-bold text-[#191c1e] text-2xl tracking-[0] leading-8 whitespace-nowrap">
                  24
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <TrendUpIcon color="text-green-600" />
              <span className=" font-medium text-green-600 text-xs tracking-[0] leading-4 whitespace-nowrap">
                12% from last quarter
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Inactive Branches */}
        <Card className="p-6 bg-white rounded-3xl border border-transparent shadow-sm">
          <CardContent className="p-0 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-orange-100 rounded-md p-3">
                <WarningIcon color="red" />
              </div>

              <div className="flex flex-col items-start">
                <span className=" font-normal text-[#464555] text-sm tracking-[0] leading-5 whitespace-nowrap">
                  Inactive Branches
                </span>
                <span className=" font-bold text-[#191c1e] text-2xl tracking-[0] leading-8 whitespace-nowrap">
                  02
                </span>
              </div>
            </div>
            <div>
              <span className=" font-normal text-[#464555] text-xs tracking-[0] leading-4">
                Requiring immediate audit review
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Active Teachers */}
        <Card className="pt-6 pb-8.5 px-6 bg-white rounded-3xl border border-transparent shadow-sm">
          <CardContent className="p-0 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 rounded-md p-3">
                <CircleCheck color="green" />
              </div>
              <div className="flex flex-col items-start">
                <span className=" font-normal text-[#464555] text-sm tracking-[0] leading-5 whitespace-nowrap">
                  Active Teachers
                </span>
                <span className=" font-bold text-[#191c1e] text-2xl tracking-[0] leading-8 whitespace-nowrap">
                  842
                </span>
              </div>
            </div>
            {/* Progress bar */}
            <div className="w-full h-1.5 bg-[#e6e8ea] rounded-full">
              <div className="w-[85%] h-full bg-emerald-500 rounded-full" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-4 p-4 self-stretch w-full bg-[#f2f4f6] rounded-3xl">
        {/* Status Filter */}
        <div className="inline-flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-solid border-[#c7c4d84c]">
          <span className=" font-bold text-[#464555] text-xs tracking-[0.60px] leading-4 whitespace-nowrap">
            STATUS:
          </span>
          <Select defaultValue="all-statuses">
            <SelectTrigger className="border-none shadow-none p-0 h-5 w-27.5 focus:ring-0  font-normal text-[#191c1e] text-sm">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-statuses">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Location Filter */}
        <div className="inline-flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-solid border-[#c7c4d84c]">
          <span className=" font-bold text-[#464555] text-xs tracking-[0.60px] leading-4 whitespace-nowrap">
            LOCATION:
          </span>
          <Select defaultValue="all-regions">
            <SelectTrigger className="border-none shadow-none p-0 h-5 w-30 focus:ring-0  font-normal text-[#191c1e] text-sm">
              <SelectValue placeholder="All Regions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-regions">All Regions</SelectItem>
              <SelectItem value="manhattan">Manhattan</SelectItem>
              <SelectItem value="queens">Queens</SelectItem>
              <SelectItem value="brooklyn">Brooklyn</SelectItem>
              <SelectItem value="staten-island">Staten Island</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Advanced Filters */}
        <div className="flex flex-1 justify-end">
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer">
            <SlidersHorizontalIcon className="w-4 h-4 text-[#3525cd]" />
            <span className=" font-normal text-[#3525cd] text-sm text-center tracking-[0] leading-5 whitespace-nowrap">
              Advanced Filters
            </span>
          </button>
        </div>
      </div>

      {/* Table */}
      <TooltipProvider>
        <div className="w-full rounded-3xl overflow-hidden border border-border shadow-sm bg-white">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent border-0">
                <TableHead className="px-6 py-4 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                  Branch ID
                </TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                  Branch Name & Address
                </TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                  Contact Person
                </TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-bold tracking-widest text-muted-foreground uppercase text-center">
                  T/S Ratio
                </TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-bold tracking-widest text-muted-foreground uppercase text-center">
                  Status
                </TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-bold tracking-widest text-muted-foreground uppercase text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {branchData.map((branch) => (
                <TableRow
                  key={branch.id}
                  className="border-t border-border hover:bg-muted/30 transition-colors"
                >
                  {/* Branch ID */}
                  <TableCell className="px-6 py-6">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-[#3525cd]/0.5 text-[#3525cd] text-xs font-bold tracking-wide">
                      {branch.id}
                    </span>
                  </TableCell>

                  {/* Branch Name & Address */}
                  <TableCell
                    className={`px-6 py-6 ${branch.opacity ? "opacity-60" : ""}`}
                  >
                    <p className="font-semibold text-sm text-foreground leading-5">
                      {branch.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-4">
                      {branch.address}
                    </p>
                  </TableCell>

                  {/* Contact Person */}
                  <TableCell
                    className={`px-6 py-6 ${branch.opacity ? "opacity-60" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={branch.contactAvatar}
                        alt={branch.contactName}
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                      />
                      <div>
                        <p className="text-sm text-foreground leading-5">
                          {branch.contactName}
                        </p>
                        <p className="text-[10px] text-muted-foreground leading-normal">
                          {branch.contactRole}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* T/S Ratio */}
                  <TableCell
                    className={`px-6 py-6 text-center ${branch.opacity ? "opacity-60" : ""}`}
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-foreground">
                          {branch.teachers}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          Teachers
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-foreground">
                          {branch.students.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          Students
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell className="px-6 py-6 text-center">
                    {branch.status === "Active" ? (
                      <Badge className="bg-[#b6b4ff] text-[#454386] hover:bg-[#b6b4ff] font-bold text-[11px] px-3 py-1 rounded-full gap-1.5 inline-flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#3525cd] shrink-0" />
                        Active
                      </Badge>
                    ) : (
                      <Badge className="bg-[#ffdad6] text-[#93000a] hover:bg-[#ffdad6] font-bold text-[11px] px-3 py-1 rounded-full gap-1.5 inline-flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a] shrink-0" />
                        Inactive
                      </Badge>
                    )}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="px-6 py-6">
                    <div className="flex items-center justify-end gap-1">
                      {/* Statistics */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-[#3525cd] hover:bg-[#3525cd]/10 transition-colors rounded-lg"
                            onClick={() => handleStats(branch.id)}
                          >
                            <BarChart2 className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p>View Statistics</p>
                        </TooltipContent>
                      </Tooltip>

                      {/* Edit */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-amber-600 hover:bg-amber-50 transition-colors rounded-lg"
                            onClick={() => handleEdit(branch.id)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p>Edit Branch</p>
                        </TooltipContent>
                      </Tooltip>

                      {/* Delete */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors rounded-lg"
                            onClick={() => handleDelete(branch.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p>Delete Branch</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between px-6 py-4 bg-muted/20 border-t border-border">
            <span className="text-xs text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground">
                {(activePage - 1) * perPage + 1}–
                {Math.min(activePage * perPage, totalBranches)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-foreground">
                {totalBranches}
              </span>{" "}
              branches
            </span>

            <div className="flex items-center gap-1">
              {/* Prev */}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg"
                disabled={activePage === 1}
                onClick={() => setActivePage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              {[1, 2, 3].map((page) => (
                <Button
                  key={page}
                  variant={activePage === page ? "default" : "ghost"}
                  size="icon"
                  className={`h-7 w-7 rounded-xl text-xs font-bold ${
                    activePage === page
                      ? "bg-[#3525cd] text-white hover:bg-[#3525cd]/90"
                      : "text-foreground"
                  }`}
                  onClick={() => setActivePage(page)}
                >
                  {page}
                </Button>
              ))}

              <span className="text-muted-foreground text-sm px-1">...</span>

              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-xl text-xs font-bold text-foreground"
                onClick={() => setActivePage(totalPages)}
              >
                {totalPages}
              </Button>

              {/* Next */}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg"
                disabled={activePage === totalPages}
                onClick={() =>
                  setActivePage((p) => Math.min(totalPages, p + 1))
                }
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
}
