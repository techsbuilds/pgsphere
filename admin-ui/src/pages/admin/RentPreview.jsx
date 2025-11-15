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
        <span className="text-green-500 p-1 px-2 bg-green-100 rounded-2xl border border-green-500">
          Completed
        </span>
      )
      
      case 'pending':
        return (
          <span className="text-yellow-500 p-1 px-2 bg-yellow-100 rounded-2xl border border-yellow-500">
            Pending
          </span>
        )
      
      case 'rejected':
        return (
          <span className="text-red-500 p-1 px-2 bg-red-100 rounded-2xl border border-red-500">
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
    <div className="flex w-full h-full gap-4 flex-col">
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
      <div className="flex flex-col gap-6 bg-white rounded-2xl p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Customer Details</h2>
          <select value={selectedMonthYear} onChange={(e)=>setSelectedMonthYear(e.target.value)} className="p-1.5 outline-none border rounded-md border-neutral-300">
            {pendingRentList.map((rent, index) => (
              <option
                key={index}
                value={`${rent.month}-${rent.year}`}
              >{`${getShortMonthName(rent.month)} ${rent.year}`}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-between border-b border-neutral-200 pb-6 items-end">
          <div className="flex gap-4 items-center">
            <div className="w-30 flex justify-center items-center h-30 bg-gray-200 rounded-full">
              <h1 className="font-semibold tracking-wider text-[#36454f] text-2xl">
                {getShortName(customerDetails?.customer_name)}
              </h1>
            </div>
            <div className="flex flex-col gap-1.5">
              <h1 className="font-medium text-lg">
                {customerDetails?.customer_name}
              </h1>
              <div className="flex items-center gap-1">
                <Phone className="w-4 h-4 text-gray-500"></Phone>
                <span className="text-gray-500 text-sm">
                  {customerDetails?.mobile_no}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <BedSingle className="w-4 h-4 text-gray-500"></BedSingle>
                  <span className="text-gray-500 text-sm">
                    {customerDetails?.room?.room_type==="Room" ? "Room" : "Hall"} {customerDetails?.room?.room_id}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Building2 className="w-4 h-4 text-gray-500"></Building2>
                  <span className="text-gray-500 text-sm">
                    Branch {customerDetails?.branch?.branch_name}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex p-1 px-2 bg-slate-100 rounded-md items-center gap-1">
                  <span>Rent Amount:</span>
                  <span className="font-medium">
                    ₹{selectedRent?.rent_amount}
                  </span>
                </div>
                <div className="flex p-1 px-2 bg-slate-100 rounded-md items-center gap-1">
                  <span>Pending Amount:</span>
                  <span className="font-medium">₹{selectedRent?.pending}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setOpenPayRentForm(true)}
              className="p-1.5 px-4 cursor-pointer rounded-md text-white bg-primary hover:bg-blue-600 transition-all duration-300"
            >
              Collect Rent
            </button>
            <button
              onClick={() => setOpenExtraChargeForm(true)}
              className="p-1.5 px-4 cursor-pointer rounded-md text-white bg-primary hover:bg-blue-600 transition-all duration-300"
            >
              Add Extra Charge
            </button>
            <button
             onClick={() => setOpenSkipRentConfirmation(true)}
             className="p-1.5 px-4 cursor-pointer rounded-md border hover:bg-gray-50 border-gray-400">
              Skip Rent
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-lg">Extra Charges</h1>
          {selectedRent?.extra_charges.length > 0 ? (
            <div className="grid md:grid-cols-4 gap-2 grid-cols-2">
              {selectedRent?.extra_charges.map((charge, index) => (
                <div
                  key={index}
                  className="flex flex-col border border-neutral-200 bg-[#F8FAFC] gap-1 rounded-2xl p-2 px-4"
                >
                  <span className="text-sm text-gray-600">{charge.name}</span>
                  <span className="font-medium">₹{charge.amount}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-10 justify-center items-center">
              <span className="text-sm text-gray-500">
                No extra charges added.
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-6 bg-white rounded-2xl p-4">
        <h2 className="text-xl font-semibold">Customer Request</h2>
        <div className="flex flex-col h-72 overflow-y-scroll gap-4">
          {customerRequest.length === 0 ? (
            <div className="flex w-full h-full justify-center items-center">
              <span>No customer request found.</span>
            </div>
          ) : (
            customerRequest.map((req, index) => (
              <div key={index} className="flex justify-between items-center p-4 rounded-2xl bg-[#f7f9fa]">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full flex justify-center items-center bg-blue-100">
                    <Banknote className="w-8 h-8 text-blue-500 m-1"></Banknote>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Amount:</span>
                        <span className="text-gray-500">₹{req.amount}</span>
                      </div>
                      <span>|</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Payment Mode:</span>
                        <span className="text-gray-500">{req.payment_mode}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Bank Account:</span>
                      <span className="text-gray-500">{req?.bank_account?.account_holdername}</span>
                    </div>
                    <button onClick={()=>handleOpenPaymentProofForm(req)} className="text-[#202947] underline text-left cursor-pointer">
                      View Payment Request
                    </button>
                  </div>
                </div>
               {
                renderStatusUi(req.status)
               }
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default RentPreview;
