/**
 * Determines if a message is currently visible based on the elapsed time or the absolute timestamp.
 *
 * @param {ParsedMessage} message - The parsed message to check.
 * @param {number} [elapsed] - The elapsed time in seconds.
 * @param {number} [absolute] - The absolute timestamp in seconds.
 * @return {boolean} - `true` if the message is currently visible, `false` otherwise.
 */
export function isMessageCurrent(
  message: ParsedMessage,
  elapsed?: number,
  absolute?: number,
): boolean {
  const duration = +(message.duration || 4000) / 1000;
  if (message.video_offset && elapsed) {
    // console.debug(
    //   `[${message.video_offset}] [${
    //     message.video_offset < elapsed
    //   }] [${elapsed}] [${elapsed <= message.video_offset + duration}] [${
    //     message.video_offset + duration
    //   }]`
    // );

    return (
      message.video_offset < elapsed &&
      elapsed <= message.video_offset + duration
    );
  } else if (absolute) {
    const timestamp = +message.timestamp / 1000;
    return timestamp < absolute && absolute <= timestamp + duration;
  }
  return false;
}
