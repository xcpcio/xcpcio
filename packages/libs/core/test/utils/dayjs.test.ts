import { describe, expect, it } from "vitest";

import { createDayJS, dayjs, getTimestamp } from "../../src/utils";

describe("dayjs", () => {
  dayjs.tz.setDefault("Asia/Shanghai");

  it("createDayJS", () => {
    const timestamp = 1686454157;
    const t = createDayJS(timestamp);
    expect(t.toJSON()).toMatchInlineSnapshot("\"2023-06-11T03:29:17.000Z\"");
    expect(t.toISOString()).toMatchInlineSnapshot("\"2023-06-11T03:29:17.000Z\"");
    expect(getTimestamp(t)).toMatchInlineSnapshot("1686454157");

    expect(dayjs.tz("2014-06-01 12:00").format()).toMatchInlineSnapshot("\"2014-06-01T12:00:00+08:00\"");
  });

  it("parse", () => {
    const d = createDayJS("2019-01-01T08:00:00+08:00");
    expect(d.unix()).toMatchInlineSnapshot("1546300800");
  });
});
