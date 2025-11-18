import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Breadcrumb from "../../components/Breadcrumb";
import { getCustomerPendingRentById } from "../../services/customerService";
import { getShortMonthName, getShortName } from "../../helper";
import PayRentForm from "../../components/PayRentForm";
import ExtraChargeForm from "../../components/ExtraChargeForm";
import PaymentProofForm from "../../components/PaymentProofForm";
import ConfirmationBox from "../../components/ConfirmationBox";

//importing icons
import { Phone, BedSingle, Building2, Banknote } from "lucide-react";
import { toast } from "react-toastify";
import { createTransactionForCustomerPay } from "../../services/transactionService";

const renderStatusUi = (status) =>{
  switch(status){
     case 'completed':
      return (
        <span className="text-green-500 md:text-base text-xs md:p-1 p-0.5 md:px-2 px-1 bg-green-100 rounded-2xl border border-green-500">
          Completed
        </span>
      )
      
      case 'pending':
        return (
          <span className="text-yellow-500 md:text-base text-xs md:p-1 p-0.5 md:px-2 px-1 bg-yellow-100 rounded-2xl border border-yellow-500">
            Pending
          </span>
        )
      
      case 'rejected':
        return (
          <span className="text-red-500 md:text-base text-xs md:p-1 p-0.5 md:px-2 px-1 bg-red-100 rounded-2xl border border-red-500">
            Rejected
          </span>
        )
  }
}

function RentPreview() {
  const location = useLocation();
  const navigate = useNavigate();
  const [customerDetails, setCustomerDetails] = useState(null);
  const [pendingRentList, setPendingRentList] = useState([]);
  const [customerRequest, setCustomerRequest] = useState([]);
  const [selectedMonthYear, setSelectedMonthYear] = useState("");
  const [selectedPaymentRequest, setSelectedPaymentRequest] = useState(null)
  const [selectedRent, setSelectedRent] = useState(null);
  const [loader, setLoader] = useState(false);

  //For modals
  const [openPayRentForm, setOpenPayRentForm] = useState(false);
  const [openExtraChargeForm, setOpenExtraChargeForm] = useState(false);
  const [openPaymentProof, setOpenPaymentProof] = useState(false)
  const [openSkipRentConfirmation, setOpenSkipRentConfirmation] = useState(false)

  useEffect(() => {
    if (!location.state.customerId) {
      navigate("/admin/customer-rent");
    }
  }, []);

  const handleGetCustomerRentDetails = async () => {
    setLoader(true);
    try {
      const data = await getCustomerPendingRentById(location.state.customerId);
      setCustomerDetails(data);
      setPendingRentList(data?.pendingRentMap);
      if (data?.pendingRentMap?.length > 0) {
        setSelectedMonthYear(
          `${data?.pendingRentMap[0]?.month}-${data?.pendingRentMap[0]?.year}`
        );
        setCustomerRequest(data?.pendingRentMap[0]?.customerRequest);
        setSelectedRent(data?.pendingRentMap[0]);
      }else{
        navigate(-1)
      }
    } catch (err) {
      console.log(err);
      toast.error(err?.message);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    handleGetCustomerRentDetails();
  }, []);

  const handleClosePayRentForm = (refresh = false) => {
    setOpenPayRentForm(false);
    if (refresh) handleGetCustomerRentDetails();
  };

  const handleCloseExtraChargeForm = (refresh = false) => {
    setOpenExtraChargeForm(false);
    if (refresh) handleGetCustomerRentDetails();
  };

  const handleOpenPaymentProofForm = (paymentRequest = null) =>{
    setSelectedPaymentRequest(paymentRequest)
    setOpenPaymentProof(true)
  }

  const handleClosePaymentProofForm = (refresh = false) =>{
    setOpenPaymentProof(false)
    if (refresh) handleGetCustomerRentDetails();
  } 

  const handleCloseSkipRentConfirmation = (refresh = false) =>{
    setOpenSkipRentConfirmation(false)
    if (refresh) handleGetCustomerRentDetails();
  }

  useEffect(()=>{
    setSelectedRent(pendingRentList.find((rent)=>rent.month===Number(selectedMonthYear.split('-')[0]) && rent.year===Number(selectedMonthYear.split('-')[1])))
  },[selectedMonthYear])

  const handleSkipCustomerRent = async () =>{
    try{
      setLoader(true)
      //api call
      const data = await createTransactionForCustomerPay({
        customer:location.state?.customerId,
        month:selectedRent?.month,
        year:selectedRent?.year,
        isSkip:true,
        isDeposite:false,
        isSettled:false,
      })
      toast.success("Rent skipped successfully")
      handleGetCustomerRentDetails()
    }catch(err){
      console.log(err)
      toast.error(err?.message)
    }finally{
      setLoader(false)
    }
  }

  return (
    <div className="flex w-full h-full gap-3 sm:gap-4 flex-col px-2 sm:px-4 lg:px-0">
      <PayRentForm
        openForm={openPayRentForm}
        onClose={handleClosePayRentForm}
        rentDetails={selectedRent}
        customerId={location.state?.customerId}
      ></PayRentForm>
      <ExtraChargeForm
        onClose={handleCloseExtraChargeForm}
        openForm={openExtraChargeForm}
        rentDetails={selectedRent}
        customerId={location.state?.customerId}
      ></ExtraChargeForm>
      <PaymentProofForm
       onClose={handleClosePaymentProofForm}
       openForm={openPaymentProof}
       requestDetails={selectedPaymentRequest}
       customerId={location.state?.customerId}
      ></PaymentProofForm>
      <ConfirmationBox
       openForm={openSkipRentConfirmation}
       onClose={handleCloseSkipRentConfirmation}
       confirmButton={"Skip Rent"}
       confirmText={`Are you sure you want to skip rent for ${getShortMonthName(selectedRent?.month)} ${selectedRent?.year}?`}
       onConfirm={handleSkipCustomerRent}
      ></ConfirmationBox>
      <Breadcrumb></Breadcrumb>
      {loader ? (
        <>
          {/* Customer Details Skeleton */}
          <div className="flex flex-col gap-4 sm:gap-6 bg-white rounded-2xl p-3 sm:p-4 animate-pulse">
            <div className="flex justify-between items-start">
              <div className="h-6 sm:h-7 bg-gray-200 rounded w-40 sm:w-48"></div>
              <div className="h-8 sm:h-9 bg-gray-200 rounded w-28 sm:w-36"></div>
            </div>
            <div className="flex flex-col lg:flex-row justify-between border-b border-neutral-200 pb-4 sm:pb-6 gap-4 lg:items-end">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full flex-shrink-0"></div>
                <div className="flex flex-col gap-2 w-full sm:w-auto">
                  <div className="h-5 sm:h-6 bg-gray-200 rounded w-32 sm:w-40"></div>
                  <div className="h-4 bg-gray-200 rounded w-24 sm:w-32"></div>
                  <div className="flex items-center gap-2 sm:gap-4">
                    <div className="h-4 bg-gray-200 rounded w-20 sm:w-24"></div>
                    <div className="h-4 bg-gray-200 rounded w-24 sm:w-32"></div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4">
                    <div className="h-6 bg-gray-200 rounded w-28 sm:w-32"></div>
                    <div className="h-6 bg-gray-200 rounded w-32 sm:w-36"></div>
                  </div>
                </div>
              </div>
              <div className="flex items-stretch sm:items-center gap-2">
                <div className="h-8 sm:h-9 bg-gray-200 rounded w-24 sm:w-28"></div>
                <div className="h-8 sm:h-9 bg-gray-200 rounded w-28 sm:w-32"></div>
                <div className="h-8 sm:h-9 bg-gray-200 rounded w-20 sm:w-24"></div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="h-5 sm:h-6 bg-gray-200 rounded w-32"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {[1, 2].map((item) => (
                  <div key={item} className="h-16 sm:h-20 bg-gray-200 rounded-2xl"></div>
                ))}
              </div>
            </div>
          </div>

          {/* Customer Request Skeleton */}
          <div className="flex flex-col gap-4 sm:gap-6 bg-white rounded-2xl p-3 sm:p-4 animate-pulse">
            <div className="h-6 sm:h-7 bg-gray-200 rounded w-40 sm:w-48"></div>
            <div className="flex flex-col gap-3 sm:gap-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex justify-between items-start sm:items-center p-3 sm:p-4 rounded-2xl bg-[#f7f9fa] gap-3">
                  <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-200 rounded-full flex-shrink-0"></div>
                    <div className="flex flex-col gap-2 flex-1">
                      <div className="h-4 bg-gray-200 rounded w-48 sm:w-64"></div>
                      <div className="h-4 bg-gray-200 rounded w-40 sm:w-52"></div>
                      <div className="h-3 bg-gray-200 rounded w-32 sm:w-40"></div>
                    </div>
                  </div>
                  <div className="h-6 sm:h-7 bg-gray-200 rounded w-20 sm:w-24"></div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col gap-4 sm:gap-6 bg-white rounded-2xl p-3 sm:p-4">
            <div className="flex justify-between items-start ">
              <h2 className="md:text-xl text-base font-semibold">Customer Details</h2>
              <select value={selectedMonthYear} onChange={(e)=>setSelectedMonthYear(e.target.value)} className="md:p-1.5 p-1 text-sm sm:text-base md:w-auto w-36 outline-none border rounded-md border-neutral-300">
                {pendingRentList.map((rent, index) => (
                  <option
                    key={index}
                    value={`${rent.month}-${rent.year}`}
                  >{`${getShortMonthName(rent.month)} ${rent.year}`}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col lg:flex-row justify-between border-b border-neutral-200 pb-4 sm:pb-6 gap-4 lg:items-end">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 flex justify-center items-center bg-gray-200 rounded-full flex-shrink-0">
                  <h1 className="font-semibold tracking-wider text-[#36454f] text-xl sm:text-2xl">
                    {getShortName(customerDetails?.customer_name)}
                  </h1>
                </div>
                <div className="flex flex-col gap-1.5 w-full sm:w-auto">
                  <h1 className="font-medium text-base sm:text-lg">
                    {customerDetails?.customer_name}
                  </h1>
                  <div className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500"></Phone>
                    <span className="text-gray-500 text-xs sm:text-sm">
                      {customerDetails?.mobile_no}
                    </span>
                  </div>
                  <div className="flex items-start sm:items-center gap-2 sm:gap-4">
                    <div className="flex items-center gap-1">
                      <BedSingle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500"></BedSingle>
                      <span className="text-gray-500 text-xs sm:text-sm">
                        {customerDetails?.room?.room_type==="Room" ? "Room" : "Hall"} {customerDetails?.room?.room_id}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500"></Building2>
                      <span className="text-gray-500 text-xs sm:text-sm">
                        Branch {customerDetails?.branch?.branch_name}
                      </span>
                    </div>
                  </div>
                  <div className="flex  items-start sm:items-center gap-2 sm:gap-4">
                    <div className="flex p-1 px-2 bg-slate-100 rounded-md items-center gap-1 text-xs sm:text-sm">
                      <span>Rent Amount:</span>
                      <span className="font-medium">
                        ₹{selectedRent?.rent_amount}
                      </span>
                    </div>
                    <div className="flex p-1 px-2 bg-slate-100 rounded-md items-center gap-1 text-xs sm:text-sm">
                      <span>Pending Amount:</span>
                      <span className="font-medium">₹{selectedRent?.pending}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setOpenPayRentForm(true)}
                  className="p-1.5 px-3 sm:px-4 cursor-pointer rounded-md text-white bg-primary hover:bg-primary/90 transition-all duration-300 text-xs sm:text-sm whitespace-nowrap"
                >
                  Collect Rent
                </button>
                <button
                  onClick={() => setOpenExtraChargeForm(true)}
                  className="p-1.5 px-3 sm:px-4 cursor-pointer rounded-md text-white bg-primary hover:bg-primary/90 transition-all duration-300 text-xs sm:text-sm whitespace-nowrap"
                >
                  Add Extra Charge
                </button>
                <button
                 onClick={() => setOpenSkipRentConfirmation(true)}
                 className="p-1.5 px-3 sm:px-4 cursor-pointer rounded-md border hover:bg-gray-50 border-gray-400 text-xs sm:text-sm whitespace-nowrap">
                  Skip Rent
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="text-base sm:text-lg">Extra Charges</h1>
              {selectedRent?.extra_charges.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {selectedRent?.extra_charges.map((charge, index) => (
                    <div
                      key={index}
                      className="flex flex-col border border-neutral-200 bg-[#F8FAFC] gap-1 rounded-2xl p-2 sm:p-2 sm:px-4"
                    >
                      <span className="text-xs sm:text-sm text-gray-600">{charge.name}</span>
                      <span className="font-medium text-sm sm:text-base">₹{charge.amount}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-10 justify-center items-center">
                  <span className="text-xs sm:text-sm text-gray-500">
                    No extra charges added.
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:gap-6 bg-white rounded-2xl p-3 sm:p-4">
            <h2 className="text-lg sm:text-xl font-semibold">Customer Request</h2>
            <div className="flex flex-col md:h-64 h-96 overflow-y-scroll gap-3 sm:gap-4">
              {customerRequest.length === 0 ? (
                <div className="flex w-full h-full justify-center items-center">
                  <span className="text-sm sm:text-base">No customer request found.</span>
                </div>
              ) : (
                customerRequest.map((req, index) => (
                  <div key={index} className="flex justify-between items-start sm:items-center p-3 sm:p-4 rounded-2xl bg-[#f7f9fa] gap-3 sm:gap-0">
                    <div className="flex items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex justify-center items-center bg-blue-100 flex-shrink-0">
                        <Banknote className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500"></Banknote>
                      </div>
                      <div className="flex flex-col gap-1 flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <span className="font-medium text-xs sm:text-sm">Amount:</span>
                            <span className="text-gray-500 text-xs sm:text-sm">₹{req.amount}</span>
                          </div>
                          <span className="hidden sm:inline">|</span>
                          <div className="flex items-center gap-1 sm:gap-2">
                            <span className="font-medium text-xs sm:text-sm">Payment Mode:</span>
                            <span className="text-gray-500 text-xs sm:text-sm">{req.payment_mode}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <span className="font-medium text-xs sm:text-sm">Bank Account:</span>
                          <span className="text-gray-500 text-xs sm:text-sm truncate">{req?.bank_account?.account_holdername}</span>
                        </div>
                        <button onClick={()=>handleOpenPaymentProofForm(req)} className="text-[#202947] underline text-left cursor-pointer text-xs sm:text-sm w-fit">
                          View Payment Request
                        </button>
                      </div>
                    </div>
                   <div className="flex-shrink-0 self-start sm:self-center">
                    {renderStatusUi(req.status)}
                   </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default RentPreview;
