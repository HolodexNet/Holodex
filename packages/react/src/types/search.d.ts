interface SearchAutoComplete {
  vtuber?: SearchAutoCompleteChannel[];
}

interface SearchAutoCompleteChannel {
  id: string;
  name: string;
  english_name?: string;
  org?: string;
}
