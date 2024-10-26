type SearchAutoCompleteType = "vtuber" | "any_channel" | "topic" | "clipper";

interface SearchAutoComplete {
  vtuber?: SearchAutoCompleteChannel[];
  topic?: SearchAutoCompleteTopic[];
  clipper?: SearchAutoCompleteChannel[];
  any_channel: SearchAutoCompleteChannel[];
}

interface SearchAutoCompleteChannel {
  id: string;
  name: string;
  english_name?: string;
  org?: string;
  type: string;
}

interface SearchAutoCompleteTopic {
  id: string;
}
