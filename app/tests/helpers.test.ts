import { describe, expect, it } from "vitest"
import {
  createBuildAwardDetailsDataFunction,
  createBuildAwardsNavigationListFunction,
  mergePicks,
  slugifyAwardName,
} from "../utils/helpers"
import { AwardPick, AwardsData, UserPick } from "~/types"

// @ts-expect-error don't want to define every single award for this mock
const mockAwards: AwardsData = {
  "Best Picture": [
    {
      title: "Oppenheimer",
      subtitle: "Christopher Nolan",
    },
  ],
  "Actress in a Leading Role": [
    {
      title: "Margot Robbie",
      subtitle: "Barbie",
    },
  ],
}

const mockPicks: UserPick = {
  userId: "mockUserId",
  picks: [
    {
      year: "2024",
      awardName: "Best Picture",
      pick: "Barbie",
    },
  ],
}

const [oppBP, barBP, lilyLA]: Array<AwardPick> = [
  {
    year: "2024",
    awardName: "Best Picture",
    pick: "Oppenheimer",
  },
  {
    year: "2024",
    awardName: "Best Picture",
    pick: "Barbie",
  },
  {
    year: "2024",
    awardName: "Actress in a Leading Role",
    pick: "Lily Gladstone",
  },
]

describe("mergePicks", () => {
  it("adds a new pick", () => {
    expect(mergePicks([], [oppBP])).toEqual([oppBP])
  })

  it("updates an existing pick", () => {
    expect(mergePicks([oppBP], [barBP])).toEqual([barBP])
  })

  it("updates an existing pick while leaving other picks unchanged", () => {
    expect(mergePicks([oppBP, lilyLA], [barBP])).toEqual([barBP, lilyLA])
  })
})

describe("slugifyAwardName", () => {
  it("transforms an award name to a URL slug", () => {
    expect(slugifyAwardName("Actress in a Leading Role")).toEqual(
      "actress-in-a-leading-role",
    )
  })

  it("transforms an award name to a URL slug when it has parentheses", () => {
    expect(slugifyAwardName("Writing (Adapted Screenplay)")).toEqual(
      "writing-adapted-screenplay",
    )
  })
})

describe("createNavListFromAwardsAndPicks", () => {
  it("builds a navigation list in the correct format with pick status", () => {
    expect(
      createBuildAwardsNavigationListFunction(mockAwards)(mockPicks),
    ).toEqual([
      {
        awardName: "Best Picture",
        isPicked: true,
        awardSlug: "best-picture",
      },
      {
        awardName: "Actress in a Leading Role",
        isPicked: false,
        awardSlug: "actress-in-a-leading-role",
      },
    ])
  })
})

describe("createBuildAwardDetailsDataFunction", () => {
  it("builds the data for the award detail page correctly", () => {
    expect(
      createBuildAwardDetailsDataFunction(mockAwards)(
        "best-picture",
        mockPicks,
      ),
    ).toEqual({
      awardName: "Best Picture",
      nominees: mockAwards["Best Picture"],
      currentPick: "Barbie",
    })
  })
})
