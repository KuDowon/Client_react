import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import SearchField from "./ui/SearchField";

function SearchBar() {
  const [searchParams]=useSearchParams();
  const initialQuery=searchParams.get("query")||"";
  const [searchTerm,setSearchTerm]=useState(initialQuery);
  const [error,setError]=useState("");
  const navigate=useNavigate();

  const handleSearch=(query=searchTerm.trim())=>{
    const trimmedQuery=(query||"").trim();
    if(!trimmedQuery){
      setError("검색어를 입력해 주세요.");
      return;
    }
    setError("");
    navigate(`/search?query=${encodeURIComponent(trimmedQuery)}`);
  };

  return (
    <div className="search-bar-v2">
      <SearchField
        value={searchTerm}
        onChange={(event)=>{setSearchTerm(event.target.value);if(error)setError("");}}
        onSearch={handleSearch}
      />
      {error?<p className="search-bar-v2__error" role="alert">{error}</p>:null}
    </div>
  );
}

export default SearchBar;
