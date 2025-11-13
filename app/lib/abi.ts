import type { Abi, ReadContractParameters, WriteContractParameters } from "viem"
import { parseAbi } from "viem"

export const ABI_REGISTRY = parseAbi([
  "function getUniqueUsersCount() external view returns (uint256)",
  "function mintCartridge(address gameAddress) external",
  "function getGames() external view returns (address[] memory)",
])

type MainParams = "abi" | "address" | "functionName" | "args"
export type ReadParameters<T> = Pick<
  ReadContractParameters<T extends Abi ? T : never>,
  MainParams
>
export type WriteParameters<T> = Pick<
  WriteContractParameters<T extends Abi ? T : never>,
  MainParams
>
