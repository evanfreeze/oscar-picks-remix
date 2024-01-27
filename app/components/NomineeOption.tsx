import { useId } from "react"
import { Nominee } from "~/types"

type NomineeOptionProps = {
  awardName: string
  nominee: Nominee
  isChecked: boolean
  onClick: () => void
}

export default function NomineeOption({
  awardName,
  nominee,
  isChecked,
  onClick,
}: NomineeOptionProps) {
  const id = useId()

  return (
    // eslint-disable-next-line jsx-a11y/label-has-associated-control
    <label
      htmlFor={id}
      className="rounded-xl px-4 py-3 block cursor-pointer hover:bg-gray-200 has-[*:checked]:bg-gray-300 has-[*:checked]:shadow-inner"
    >
      <input
        id={id}
        type="radio"
        name={awardName}
        value={nominee.title}
        className="hidden"
        defaultChecked={isChecked}
        onClick={onClick}
      />
      <p className="flex flex-col">
        <span className="text-md font-semibold leading-tight">
          {nominee.title}
        </span>
        <span className="text-gray-700 text-sm leading-tight">
          {nominee.subtitle}
        </span>
      </p>
    </label>
  )
}
