import { useLive } from "@/services/live.service"


export function Home () {
	const { data } = useLive();

	return (
		<div className="w-full h-full">
			{JSON.stringify(data)}
		</div>
	)
}