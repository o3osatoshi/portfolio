/**
 * Legacy attachment object.
 * Roughly corresponds to `@slack/types` `MessageAttachment`.
 * Reference: https://docs.slack.dev/messaging/formatting-message-text#attachments
 */
export type SlackAttachment = {
  [key: string]: unknown;
  blocks?: SlackBlock[];
  color?: string;
  fields?: SlackAttachmentField[];
  text?: string;
};

/**
 * Attachment field for legacy attachments.
 * Roughly corresponds to `@slack/types` `AttachmentField`.
 * Reference: https://docs.slack.dev/messaging/formatting-message-text#attachments
 */
export type SlackAttachmentField = {
  short?: boolean;
  title?: string;
  value?: string;
};

/**
 * Block union for message layout.
 * Roughly corresponds to `@slack/types` `KnownBlock | Block`.
 */
export type SlackBlock =
  | SlackDividerBlock
  | SlackGenericBlock
  | SlackHeaderBlock
  | SlackSectionBlock;

/**
 * Base block type.
 * Roughly corresponds to `@slack/types` `Block`.
 * Reference: https://docs.slack.dev/reference/block-kit/blocks
 */
export type SlackBlockBase = {
  block_id?: string;
  type: string;
};

/**
 * Block element used in accessories.
 * Roughly corresponds to `@slack/types` block element unions.
 * Reference: https://docs.slack.dev/reference/block-kit/block-elements
 */
export type SlackBlockElement = {
  [key: string]: unknown;
  type?: string;
};

/**
 * Divider block.
 * Roughly corresponds to `@slack/types` `DividerBlock`.
 * Reference: https://docs.slack.dev/reference/block-kit/blocks#divider
 */
export type SlackDividerBlock = {
  type: "divider";
} & SlackBlockBase;

/**
 * Catch-all block for types not modeled explicitly.
 * Roughly corresponds to any `@slack/types` `Block`.
 */
export type SlackGenericBlock = Record<string, unknown> & SlackBlockBase;

/**
 * Header block.
 * Roughly corresponds to `@slack/types` `HeaderBlock`.
 * Reference: https://docs.slack.dev/reference/block-kit/blocks#header
 */
export type SlackHeaderBlock = {
  text: SlackPlainTextObject;
  type: "header";
} & SlackBlockBase;

/**
 * Message payload for `chat.postMessage`.
 * Roughly corresponds to `@slack/web-api` `ChatPostMessageArguments`.
 * Reference: https://docs.slack.dev/reference/methods/chat.postMessage
 */
export type SlackMessage = {
  [key: string]: unknown;
  as_user?: boolean;
  attachments?: SlackAttachment[];
  blocks?: SlackBlock[] | undefined;
  channel: string;
  icon_emoji?: string;
  icon_url?: string;
  link_names?: boolean;
  markdown_text?: string;
  metadata?: SlackMessageMetadata;
  mrkdwn?: boolean;
  parse?: "full" | "none";
  reply_broadcast?: boolean;
  text?: string | undefined;
  thread_ts?: string;
  token?: string;
  unfurl_links?: boolean;
  unfurl_media?: boolean;
  username?: string;
};

/**
 * Message metadata entity.
 * Roughly corresponds to `@slack/web-api` `EntityMetadata`.
 */
export type SlackMessageEntity = {
  [key: string]: unknown;
  id?: string;
  type?: string;
};

/**
 * Message metadata.
 * Roughly corresponds to `@slack/web-api` `ChatPostMessageMetadata`/`MessageMetadata`.
 * Reference: https://docs.slack.dev/messaging/metadata
 */
export type SlackMessageMetadata = {
  entities?: SlackMessageEntity[];
  event_payload?: Record<string, unknown>;
  event_type?: string;
};

/**
 * Mrkdwn text object used in Block Kit messages.
 * Roughly corresponds to `@slack/types` `MrkdwnElement`.
 * Reference: https://docs.slack.dev/reference/block-kit/composition-objects#text
 */
export type SlackMrkdwnTextObject = {
  text: string;
  type: "mrkdwn";
  verbatim?: boolean;
};

/**
 * Plain text object used in Block Kit messages.
 * Roughly corresponds to `@slack/types` `PlainTextElement`.
 * Reference: https://docs.slack.dev/reference/block-kit/composition-objects#text
 */
export type SlackPlainTextObject = {
  emoji?: boolean;
  text: string;
  type: "plain_text";
};

/**
 * Minimal posted message shape.
 * Roughly corresponds to `@slack/web-api` `ChatPostMessageResponseMessage`.
 */
export type SlackPostedMessage = {
  [key: string]: unknown;
  blocks?: SlackBlock[];
  text?: string;
  ts?: string;
};

/**
 * Response from `chat.postMessage`.
 * Roughly corresponds to `@slack/web-api` `ChatPostMessageResponse`.
 */
export type SlackPostMessageResponse = {
  [key: string]: unknown;
  channel?: string | undefined;
  error?: string | undefined;
  message?: SlackPostedMessage;
  needed?: string;
  ok: boolean;
  provided?: string;
  response_metadata?: SlackResponseMetadata;
  ts?: string | undefined;
};

/**
 * Response metadata wrapper.
 * Roughly corresponds to `@slack/web-api` `WebAPICallResult["response_metadata"]`.
 */
export type SlackResponseMetadata = {
  [key: string]: unknown;
  acceptedScopes?: string[];
  messages?: string[];
  next_cursor?: string;
  retryAfter?: number;
  scopes?: string[];
  warnings?: string[];
};

/**
 * Section block.
 * Roughly corresponds to `@slack/types` `SectionBlock`.
 * Reference: https://docs.slack.dev/reference/block-kit/blocks#section
 */
export type SlackSectionBlock = {
  accessory?: SlackBlockElement;
  fields?: SlackTextObject[];
  text?: SlackTextObject;
  type: "section";
} & SlackBlockBase;

/**
 * Text object for Block Kit blocks.
 * Roughly corresponds to `@slack/types` `TextObject`.
 * Reference: https://docs.slack.dev/reference/block-kit/composition-objects#text
 */
export type SlackTextObject = SlackMrkdwnTextObject | SlackPlainTextObject;
