
/**

Copyright 2023 Bodastage Solutions Ltd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
#ifndef __BODA_UTILS_H
#define __BODA_UTILS_H

#include <vector>
#include <string>
#include <cctype>
#include <functional>
#include <algorithm>
#include <boost/algorithm/string.hpp>
#include <locale>
#include <filesystem>

namespace fs = std::filesystem;

using namespace std;

namespace bodastage {

    enum ParserStates { 
        
        //managed object parser extraction stage 
        EXTRACTING_PARAMETERS = 1, 
        
        //Parameter value extraction stage
        EXTRACTING_VALUES = 2,

        //parsing done
        EXTRACTING_DONE = 3
    };

    // trim from start (in place)
    static inline void ltrim(std::string &s) {
        s.erase(s.begin(), std::find_if(s.begin(), s.end(), [](unsigned char ch) {
            return !std::isspace(ch);
        }));
    }

    string ltrim_str(std::string ss);

    // trim from end (in place)
    static inline void rtrim(std::string &s) {
        s.erase(std::find_if(s.rbegin(), s.rend(), [](unsigned char ch) {
            return !std::isspace(ch);
        }).base(), s.end());
    }

    // trim from end (in place)
    string rtrim_str(std::string ss);

    // trim from both ends (in place)
    void trim(std::string &s);

    // trim from both ends (in place)
    static inline string trim_str(std::string s) {
        return ltrim_str(rtrim_str(s));
    }

    // trim from start (copying)
    static inline std::string ltrim_copy(std::string s) {
        ltrim(s);
        return s;
    }

    // trim from end (copying)
    static inline std::string rtrim_copy(std::string s) {
        rtrim(s);
        return s;
    }

    // trim from both ends (copying)
    static inline std::string trim_copy(std::string s) {
        trim(s);
        return s;
    }

    std::vector<std::string> split_str(std::string str, std::string delimeter);

    bool file_is_readable(const fs::path& p);

    bool file_is_writable(const fs::path& p);

    bool is_directory(const fs::path& p);

    bool is_regular_file(const fs::path& p);

    bool starts_with(std::string s, string prefix);

    bool ends_with(std::string s, string suffix);

    string tolower(std::string s);

    /**
     * @brief Replace all occurrences of a string with another string.
    */
    string str_replace(std::string haystack, string needle, string replacement);

    /**
     * @brief Check if a string contains another string.
    */
    bool str_contains(std::string haystack, string needle);

    //@TODO: use references instead of copying
    template <typename T> bool value_in_vector(std::vector<T> v, T needle){
        return std::find(v.begin(), v.end(), needle) != v.end();
    }

    /**
     * @brief Get file base name.
     *
     * @since 1.0.0
     */
    string get_file_basename(std::string filename);

    /**
     * @brief Take a string and replace based on regular expression.
    */
    string preg_replace(std::string s, string rgx, string replacement);

    /**
     * @brief Take a string and replace based on regular expression.
    */
    bool preg_match(std::string s, string rgx);

    /**
     * @brief Take a string and split it based on regular expression.
    */
    std::vector<std::string> preg_split(std::string &s, std::string rgx);

    /**
     * @brief Take a string and replace based on regular expression.
    */
    string preg_match(std::string s);

    /**
     * @brief Convert wide string to string.
    */
    string wstr_to_str(wchar_t *wstr);

    /**
     * Return the separator for the current platform.
    */
    string get_sep();
}

#endif //__BODA_UTILS_H