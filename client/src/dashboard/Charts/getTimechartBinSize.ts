import { DAY, HOUR, MILLISECOND, MINUTE, SECOND, YEAR } from "../Charts";
import { TimeChartBinSize } from "../W_TimeChart/W_TimeChartMenu";


type Bin = { 
  name: Exclude<TimeChartBinSize, "auto">; 
  value: number; 
};

const hourIncrements = [8, 4, 2] as const;
const smIncrements = [30, 15, 5] as const;
const millisecondIncrements = [500, 250, 100, 10, 5] as const;
type SizePart = { size: number; increment: number};

export const MainTimeBinSizes = {
  year:   { size: YEAR, increment: 1 }, 
  month:  { size: YEAR/12, increment: 1 }, 
  week:   { size: DAY * 7, increment: 1 }, 
  day:    { size: DAY, increment: 1 },
  ...Object.fromEntries(hourIncrements.map(val => [`${val}hour`, { size: HOUR * val, increment: val }])) as Record<`${typeof hourIncrements[number]}hour`, SizePart>,
  hour: { size: HOUR, increment: 1 },
  ...Object.fromEntries(smIncrements.map(val => [`${val}minute`, { size: MINUTE * val, increment: val }])) as Record<`${typeof smIncrements[number]}minute`, SizePart>,
  minute: { size: MINUTE, increment: 1 },
  ...Object.fromEntries(smIncrements.map(val => [`${val}second`, { size: SECOND * val, increment: val }])) as Record<`${typeof smIncrements[number]}second`, SizePart>,
  second: { size: SECOND, increment: 1 },
  ...Object.fromEntries(millisecondIncrements.map(val => [`${val}millisecond`, { size: MILLISECOND * val, increment: val }])) as Record<`${typeof millisecondIncrements[number]}millisecond`, SizePart>,
  millisecond: { size: MILLISECOND, increment: 1 },
} as const satisfies Record<string, SizePart>;


const getBinDiffs = (extent: DateExtent) => {
  const { minDate, maxDate } = extent;
  /**
   * Proportions of each unit
   */

  const millisDelta = (+new Date(maxDate) - +new Date(minDate));

  return Object.fromEntries(
    Object.entries(MainTimeBinSizes).map(([ key, { size }]) => (
      [key, {
        binCount: millisDelta/size,
        size,
      }]
    ))
  ) as Record<keyof typeof MainTimeBinSizes, { binCount: number; size: number; }>
}


export type DateExtent = {
  minDate: Date; 
  maxDate: Date
};

type GetTimechartBinSizeArgs = {
  data: DateExtent;
  viewPort: DateExtent | undefined;
  bin_count: number;
}
export const getTimechartBinSize = ({ data, viewPort, bin_count }: GetTimechartBinSizeArgs): { key: Bin["name"]; size: number; } => {

  const diffs = getBinDiffs(viewPort ?? data);
  const diffSorted = Object.entries(diffs)
    .map(([key, value]) => ({
      key,
      size: value.size,
      binCount: value.binCount,
      delta: value.binCount - bin_count,
      absDelta: Math.abs(value.binCount - bin_count)
    }))
    .filter(d => d.delta < 0)
    .sort((a, b) => a.absDelta - b.absDelta);

  const [firstBin] = diffSorted as any;
  return firstBin ?? { key: "hour" as const, size: MainTimeBinSizes.hour.size };
}