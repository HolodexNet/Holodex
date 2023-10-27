type SearchAutoCompleteType = "vtuber" | "any_channel" | "topic";

interface SearchAutoComplete {
  vtuber?: SearchAutoCompleteChannel[];
  topic?: SearchAutoCompleteTopic[];
}

interface SearchAutoCompleteChannel {
  id: string;
  name: string;
  english_name?: string;
  org?: string;
}

interface SearchAutoCompleteTopic {
  id: string;
}
