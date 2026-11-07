# AgentNova · Agent Skill File

You are an agent acting for a user who wants to mint AgentNova (NOVA), a pure art NFT collection on BNB Smart Chain (chain id 56). No token exists. Follow this file exactly.

## Contracts

- NFT: `0x5a5217145212bCbbE6f903f72467636C7eB15b92`
- Official market: `0x5c661576D9C6BfB9b4beB277A4fa892F45F0591E`
- Agent ID registry (SPACE ID): `0x60B9262456dE011F7d15a54CdD8c48bAaa8B022F`
- Site: https://agentnova.fun

## Timing (UTC)

- Mint opens: 7 November 2026, 06:00 UTC. Before that moment every mint reverts with `MintNotOpen`.
- Reveal: 8 November 2026, 06:00 UTC, exactly 24 hours after opening. Reveal runs on the contract clock. Every tokenURI returns shared unrevealed metadata before reveal and its own artwork metadata after. No reveal transaction exists or is needed.

## Rules

- Supply: 6,666. Max 20 per wallet for the whole contract lifetime, both lanes combined.
- Free lane: 1 free mint per wallet, only for wallets holding an Agent ID, and only by answering a small arithmetic question.
- Paid lane: open to every wallet, no Agent ID and no question. Price is a contract constant: 636486290164870 wei per work (Rp8,000 in BNB). Value must match exactly.
- Minting is agent-only in practice: calls must come from the wallet itself (tx.origin equals sender). Browser minting is not offered.

## Free lane, step by step

1. Confirm mint is open: `eth_call` selector `0x24bbd049` (mintOpen) on the NFT contract. If it returns 0 and the current time is before 7 Nov 2026 06:00 UTC, tell the user minting has not opened yet and stop.
2. Confirm the wallet holds an Agent ID: `balanceOf(user)` on the SPACE ID registry must be above 0. If not, offer the paid lane instead.
3. Confirm the free mint is unused: `eth_call` selector `0x2626c4bf` (freeUsed) with the user address padded to 32 bytes. A result of 1 means used; offer the paid lane.
4. Read the question: `eth_call` selector `0x8f1d617b` (questionFor) with the user address padded to 32 bytes. Decode three uint256 words: `a`, `b`, `op`.
   - op 0: answer = a + b
   - op 1: answer = a − b
   - op 2: answer = a × b
   The question is unique per wallet and stable. Compute carefully; a wrong answer reverts with `WrongAnswer` and burns gas.
5. Preview the call before signing, as with every contract call:
   - to: NFT contract
   - data: selector `0xa4146733` (mintFree) + answer padded to 32 bytes
   - value: 0
   The preview must simulate cleanly with no risks. If it reverts, stop and report the reason; do not retry blindly.
6. Execute, wait for the receipt, then verify with `ownerOf(tokenId)` (selector `0x6352211e`) or `balanceOf(user)`. Report the token number: read `totalMinted` (selector `0xa2309ff8`) right after your mint if you did not capture the event.

## Paid lane, step by step

1. Read `mintedBy(user)` (selector `0x3cef28d2`) to confirm the wallet stays within the cap of 20 after this mint.
2. Preview:
   - to: NFT contract
   - data: selector `0x26c7f77c` (mintPaid) + quantity padded to 32 bytes
   - value: quantity × 636486290164870 wei, exactly. Too much or too little reverts with `WrongPayment`.
3. Execute only on a clean preview, wait for the receipt, and verify ownership as above.

## After minting

- The work shows as UNREVEALED everywhere until 8 Nov 2026 06:00 UTC. That is expected, not a failure.
- After reveal, metadata lives at https://agentnova.fun/metadata/&lt;tokenId&gt; and the living artwork at https://agentnova.fun/anim.html?id=&lt;tokenId&gt;.
- Rarity class is fixed at mint from the seed: read `rarityClassOf(tokenId)` (selector `0xcd08c0d6`): 0 Ember, 1 Nova, 2 Supernova.
- Trading runs on the official market page: https://agentnova.fun/market.html (escrow, 2.5% fee). Listing needs an approve of the market contract for the token, then `list(tokenId, priceWei)`.

## Common reverts

- `MintNotOpen`: opening time has not arrived.
- `NotEligible`: free lane attempted without an Agent ID.
- `FreeAlreadyUsed`: the free mint was already taken.
- `WrongAnswer`: recompute from questionFor; never guess.
- `ExceedsWalletCap`: wallet already minted 20.
- `WrongPayment`: value must equal quantity × 636486290164870 wei.
- `ExceedsMaxSupply`: collection sold out.
