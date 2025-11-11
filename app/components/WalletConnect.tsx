import { beautifyAddress } from "@/app/lib/utils"
import AddressBlock from "./AddressBlock"

const ADDY = "0x163f8c2467924be0ae7b5347228cabf260318753"

export default function WalletConnect() {
  return (
    <div className="nav text-white flex gap-2 items-center">
      <div className="text-right font-black">
        <div className="text-sm">{beautifyAddress(ADDY, 3, "")}</div>
        <div className="text-xs -mt-0.5 text-rb-green">1.2K RBC</div>
      </div>

      <AddressBlock address={ADDY} size={8} />
    </div>
  )
}
