import { blo } from "blo"
import { beautifyAddress } from "@/app/lib/utils"

const ADDY = "0x163f8c2467924be0ae7b5347228cabf260318753"

export default function WalletConnect() {
  return (
    <div className="nav text-white flex gap-2 items-center">
      <div className="text-right">
        <div className="font-bold text-sm">{beautifyAddress(ADDY, 3, "")}</div>
        <div className="text-xs -mt-0.5 text-rb-green font-bold">1.2K GTP</div>
      </div>

      <div className="border-2 border-white/15 rounded-lg overflow-hidden">
        <figure
          style={{
            backgroundImage: `url(${blo(ADDY, 16)})`,
            filter: "sepia(1) saturate(0.5) brightness(0.7) contrast(1.2)",
          }}
          className="size-8 bg-cover shrink-0"
        />
      </div>
    </div>
  )
}
