import React, { useEffect, useState } from "react";
import Breadcrumb from "../../components/Breadcrumb";
import {
  getDailyUpdates,
  createDailyUpdate,
} from "../../services/dailyUpdateService";
import { getAllBranch } from "../../services/branchService";
import { toast } from "react-toastify";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { timeAgo } from "../../helper";
import { dailyupdateSchema } from "../../validations/dailyupdateSchema";
import MultiSelectDropdown from "../../components/MultiSelectDropdown";
import { deleteDailyUpdate } from "../../services/dailyUpdateService";

//Importing icons
import { Send, Funnel, Bell, CircleAlert, Wrench, Trash } from "lucide-react";

const getUpdateIcon = (type) => {
  switch (type) {
    case "General":
      return (
        <span className="bg-blue-50 p-2 rounded-full">
          <Bell size={18} className="text-blue-500"></Bell>
        </span>
      );
    case "Notice":
      return (
        <span className="bg-red-50 p-2 rounded-full">
          <CircleAlert size={18} className="text-red-500"></CircleAlert>
        </span>
      );
    case "Maintenance":
      return (
        <span className="bg-yellow-50 p-2 rounded-full">
          <Wrench size={18} className="text-yellow-500"></Wrench>
        </span>
      );
  }
};

const getUpdateColor = (type) => {
  switch (type) {
    case "General":
      return "text-blue-500 bg-blue-100";
    case "Notice":
      return "text-red-500 bg-red-100";
    case "Maintenance":
      return "text-yellow-500 bg-yellow-100";
  }
};

function DailyUpdate() {
  const [dailyUpdate, setDailyUpdate] = useState([]);
  const [loader, setLoader] = useState(false);
  const [branch, setBranch] = useState([]);
  const [branchOptions, setBranchOptions] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    mode: "onChange",
    resolver: zodResolver(dailyupdateSchema),
    defaultValues: {
      branch: [],
      content_type: "General",
      title: "",
    },
  });

  useEffect(() => {
    const handleGetAllBranch = async () => {
      try {
        const data = await getAllBranch();
        setBranchOptions(
          data.map((item) => ({ label: item.branch_name, value: item._id }))
        );
        setBranch(data);
      } catch (err) {
        console.log(err);
        toast.error(err?.message || "Failed to fetch branches");
      }
    };
    handleGetAllBranch();
  }, []);

  const handleGetDailyUpdates = async () => {
    try {
      const data = await getDailyUpdates(selectedBranch);
      console.log(data);
      setDailyUpdate(data);
    } catch (err) {
      console.log(err);
      toast.error(err?.message || "Failed to fetch daily updates");
    }
  };

  useEffect(() => {
    handleGetDailyUpdates();
  }, [selectedBranch]);

  const handleSendUpdate = async (formData) =>{
    try{
      const data = await createDailyUpdate(formData)
      handleGetDailyUpdates()
      reset({
        branch: [],
        content_type: "General",
        title: "",
      })
      toast.success("Update sent successfully")
    }catch(err){
      console.log(err)
      toast.error(err?.message || "Failed to send update")
    }
  }

  const handleDeleteUpdate = async (id) => {
    try{
      const data = await deleteDailyUpdate(id)
      toast.success('Daily update deleted')
      handleGetDailyUpdates()
    }catch(err){
      console.log(err)
    }
  }

  return (
    <div className="flex flex-col gap-4 h-full w-full overflow-hidden px-2 sm:px-0">
      <Breadcrumb></Breadcrumb>
      <div className="w-full flex flex-col lg:flex-row gap-4 flex-1 min-h-0 overflow-hidden items-start">
        {/* Left Side Add Form - Fixed Position, Fit Content */}
        <div className="w-full lg:w-[40%] overflow-hidden border border-neutral-300 bg-white flex flex-col rounded-2xl self-start">
          <div className="p-3 sm:p-4 bg-[#202947]">
            <div className="flex items-center gap-2">
              <Send className="text-white" size={18}></Send>
              <h1 className="text-white font-medium text-sm sm:text-base">Create New Update</h1>
            </div>
            <span className="text-white text-xs sm:text-sm">
              Fill in the details to send an update
            </span>
          </div>
          <form onSubmit={handleSubmit(handleSendUpdate)} className="p-3 sm:p-4 flex flex-col gap-3 sm:gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-medium text-xs sm:text-sm">
                Select Branch <span className="text-sm text-red-500">*</span>
              </label>
              <div className="flex flex-col">
                <Controller
                  name="branch"
                  control={control}
                  render={({ field }) => (
                    <MultiSelectDropdown
                      options={branchOptions}
                      selected={field.value || []} // controlled by RHF
                      onChange={(val) => field.onChange(val)} // update RHF state
                      placeholder="--Select Branch--"
                    />
                  )}
                />
                {errors.branch && (
                  <span className="text-xs sm:text-sm text-red-500 mt-1">
                    {errors.branch.message}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium text-xs sm:text-sm">
                Update Type <span className="text-sm text-red-500">*</span>
              </label>
              <Controller
                name="content_type"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-3 items-center gap-2">
                    {["General", "Notice", "Maintenance"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => field.onChange(type)}
                        className={`p-2 sm:p-2.5 text-xs sm:text-sm border rounded-2xl transition-all duration-300 ${
                          field.value === type
                            ? "bg-blue-500 text-white border-blue-500"
                            : "bg-gray-100 border-neutral-300 hover:bg-neutral-200"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}
              />
              {errors.content_type && (
                <p className="text-red-500 text-xs">
                  {errors.content_type.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-medium text-xs sm:text-sm">
                Update Message <span className="text-sm text-red-500">*</span>
              </label>
              <div className="flex flex-col">
               <textarea
                {...register("title")}
                rows={8}
                className="p-2 sm:p-3 text-sm resize-none rounded-md border outline-none border-neutral-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Write your update here"
               ></textarea>
               {errors.title && (<span className="text-xs sm:text-sm text-red-500">{errors.title.message}</span>)}
              </div>
            </div>
            <button type="submit" disabled={loader} className="p-2.5 sm:p-3 bg-primary text-xs sm:text-sm hover:bg-blue-600 transition-all duration-300 text-white rounded-md cursor-pointer font-medium">
              Send Update
            </button>
          </form>
        </div>

        {/* Right side show all updates - Scrollable */}
        <div className="w-full lg:w-[60%] flex flex-col gap-3 sm:gap-4 rounded-2xl p-3 sm:p-4 min-h-0 flex-1 overflow-hidden bg-white border border-neutral-300 lg:border-0 lg:bg-transparent">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 flex-shrink-0">
            <h1 className="font-medium text-base sm:text-lg">All Updates</h1>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <div className="flex items-center gap-2">
                <Funnel size={16} className="sm:w-[18px] sm:h-[18px]"></Funnel>
                <span className="text-xs sm:text-sm">Filter By Branch</span>
              </div>
              <select
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full sm:w-auto p-2 sm:p-1.5 text-sm bg-white border border-neutral-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value={""}>All Branch</option>
                {branch.map((b, index) => (
                  <option key={index} value={b._id}>
                    {b.branch_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div
            className="flex-1 overflow-y-auto min-h-0 pr-1 sm:pr-2 flex flex-col gap-2"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#d1d5db #f3f4f6",
            }}
          >
            {dailyUpdate.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 py-8">
                <Bell size={40} className="sm:w-12 sm:h-12 text-neutral-400"></Bell>
                <span className="text-sm sm:text-base text-neutral-500">No updates found</span>
              </div>
            ) : (
              dailyUpdate.map((update, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-neutral-300 flex flex-col sm:flex-row justify-between items-start gap-3"
                >
                  <div className="flex w-full items-start gap-3 sm:gap-4">
                    {getUpdateIcon(update.content_type)}
                    <div className="flex justify-between w-full items-start gap-2">
                      <div className="flex flex-col gap-2 flex-1">
                        <h1 className="font-medium text-xs sm:text-sm leading-snug">{update.title}</h1>

                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          {update.branch.slice(0, 3).map((b, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-neutral-100 p-1 px-2 rounded-md"
                            >
                              {b.branch_name}
                            </span>
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          {timeAgo(update.createdAt)}
                        </span>
                      </div>
                      <div className="flex flex-col md:flex-row items-center md:gap-2 gap-1">
                        <span className={`text-xs ${getUpdateColor(update.content_type)} md:p-1.5 p-1 px-2 md:px-2.5 rounded-md whitespace-nowrap`}>
                          {update.content_type}
                        </span>
                        <button className="p-1 cursor-pointer md:p-1.5 rounded-md bg-red-50 hover:bg-red-100 transition-all duration-300" onClick={() => handleDeleteUpdate(update._id)}>
                          <Trash size={16} className="text-red-500"></Trash>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DailyUpdate;
