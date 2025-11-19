import type { Abi, ReadContractParameters, WriteContractParameters } from "viem"
import { parseAbi } from "viem"

export const ABI_REGISTRY = parseAbi([
  "function getUniqueUsersCount() external view returns (uint256)",
  "function mintCartridge(address gameCollection, uint256 _nonce, uint256 _deadline, bytes calldata _signature) external",
  "function getGames() external view returns (address[] memory)",
  "function getPrice(address gameCollection) external view returns (uint256)",
])

export const ABI_DISPENSER = parseAbi([
  "function claim(uint256 amount, uint256 deadline, bytes calldata signature) external",
  "function nonces(address) public view returns (uint256)",
  "function claimed(address) view returns (uint256)",
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
