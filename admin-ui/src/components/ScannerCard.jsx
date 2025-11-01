
import { useAuth } from "../context/AuthContext"
import { Image, SquarePen, User } from "lucide-react"

function ScannnerCard({ openForm, item }) {

    const { auth } = useAuth()


    return (
        <div
            className="rounded-2xl relative hover:scale-[1.02] transition-all duration-300 overflow-hidden shadow-sm border cursor-pointer border-neutral-300"
        >
            {
                auth.user.userType === "Admin" &&
                <div className="absolute p-1 right-2 top-2 hover:bg-black/80 transition-all duration-300 bg-black/40 backdrop-blur-sm rounded-md">
                    <SquarePen
                        onClick={(e) => {
                            e.stopPropagation()
                            openForm(item)
                        }} size={18} className="text-white">
                    </SquarePen>
                </div>
            }
            {item.sc_image ? (
                <img className="h-48 object-cover w-full" src={item.sc_image}></img>
            ) : (
                <div className="bg-gradient-to-br from-[#5f9df9] to-[#636ef2] w-full h-48 flex justify-center items-center">
                    <Image size={40} className="text-white"></Image>
                </div>
            )}
            <div className="p-4 bg-white flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <User></User>
                    {item.bankaccount?.account_holdername}
                </div>
                <span className="text-gray-500 text-sm">{item?.branch?.branch_name}</span>
            </div>

        </div >
    )
}

export default ScannnerCard