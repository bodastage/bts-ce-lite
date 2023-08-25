
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
#include <vector>
#include <string>
#include <cctype>
#include <functional>
#include <algorithm>
#include <boost/algorithm/string.hpp>
#include <locale>
#include <regex>
#include "bodautils.h"
#include "spdlog/spdlog.h"
#include <typeinfo>

namespace fs = std::filesystem;

using namespace std;

string bodastage::ltrim_str(std::string ss) {
    string s = ss;
    s.erase(s.begin(), std::find_if(s.begin(), s.end(), [](unsigned char ch) {
        return !std::isspace(ch);
    }));
    return s;
}


// trim from end (in place)
string bodastage::rtrim_str(std::string ss) {
    string s = ss;
    s.erase(std::find_if(s.rbegin(), s.rend(), [](unsigned char ch) {
        return !std::isspace(ch);
    }).base(), s.end());
    return s;

}

// trim from both ends (in place)
void bodastage::trim(std::string &s) {
    rtrim(s);
    ltrim(s);
}

std::vector<std::string> bodastage::split_str(
    std::string str,
    std::string delimeter)
{
    std::vector<std::string> splittedStrings = {};
    size_t pos = 0;

    while ((pos = str.find(delimeter)) != std::string::npos)
    {
        std::string token = str.substr(0, pos);
        if (token.length() > 0)
            splittedStrings.push_back(token);
        str.erase(0, pos + delimeter.length());
    }

    if (str.length() > 0)
        splittedStrings.push_back(str);
    return splittedStrings;
}


bool bodastage::file_is_readable(const fs::path& p)
{
    std::error_code ec; // For noexcept overload usage.
    auto perms = fs::status(p, ec).permissions();
    if ((perms & fs::perms::owner_read) != fs::perms::none &&
        (perms & fs::perms::group_read) != fs::perms::none &&
        (perms & fs::perms::others_read) != fs::perms::none
        )
    {
        return true;
    }
    return false;
}

bool bodastage::file_is_writable(const fs::path& p)
{
    std::error_code ec; // For noexcept overload usage.
    auto perms = fs::status(p, ec).permissions();
    if ((perms & fs::perms::owner_write) != fs::perms::none &&
        (perms & fs::perms::group_write) != fs::perms::none &&
        (perms & fs::perms::others_write) != fs::perms::none
        )
    {
        return true;
    }
    return false;
}

bool bodastage::is_directory(const fs::path& p){
    std::error_code ec; 
    if (fs::is_directory(p, ec)) return true;
    return false;
}

bool bodastage::is_regular_file(const fs::path& p){
    std::error_code ec; 
    if (fs::is_regular_file(p, ec)) return true;
    return false;
}

bool bodastage::starts_with(std::string s, string prefix){
    return (s.rfind(prefix, 0) == 0);
}

bool bodastage::ends_with(std::string s, string suffix){
    return (s.rfind(suffix, s.length() - suffix.length()) == 0);
}

string bodastage::tolower(std::string s){
    string s_tmp = s;
    //std::transform(s_tmp.begin(), s_tmp.end(), s_tmp.begin(), [](unsigned char c) { return std::tolower(c); });
    //return s;
    boost::algorithm::to_lower(s_tmp);

    return s_tmp;
}

/**
 * @brief Replace all occurrences of a string with another string.
*/
string bodastage::str_replace(std::string haystack, string needle, string replacement){
    string s = haystack;

    if(s.find(needle) == string::npos) return s;

    //@TODO: add while loop to replace all occurrences
    s.replace(s.find(needle), needle.length(), replacement);
    return s;
}

/**
 * @brief Check if a string contains another string.
*/
bool bodastage::str_contains(std::string haystack, string needle){
    return (haystack.find(needle) != std::string::npos);
}

/**
 * @brief Get file base name.
 *
 * @since 1.0.0
 */
string bodastage::get_file_basename(std::string filename) {
    return fs::path(filename).filename().u8string();
}

/**
 * @brief Take a string and replace based on regular expression.
*/
string bodastage::preg_replace(std::string s, string rgx, string replacement){
    std::regex _rgx(rgx);
    return std::regex_replace(s, _rgx, replacement);
}

/**
 * @brief Take a string and replace based on regular expression.
*/
bool bodastage::preg_match(std::string s, string rgx){
    std::regex _rgx(rgx);
    std::smatch base_match;
    return std::regex_match(s, base_match, _rgx);
}

/**
 * @brief Take a string and split it based on regular expression.
*/
std::vector<std::string> bodastage::preg_split(std::string &s, string rgx) {
    std::regex _regex = std::regex(rgx);

    std::vector<string> _parts;
    std::copy(std::sregex_token_iterator(s.begin(), s.end(), _regex, -1),
          std::sregex_token_iterator(),
          std::back_inserter(_parts));

    return _parts;
}

/**
 * @brief Take a string and replace based on regular expression.
*/
string bodastage::preg_match(std::string s){

    //@todo: add implementation
    return s;
}

/**
 * @brief Convert wide string to string.
*/
string bodastage::wstr_to_str(wchar_t *wstr){
    std::wstring ws(wstr);
    string str(ws.begin(), ws.end());
    return str;
}

string bodastage::get_sep(){
    if(typeid(fs::path::preferred_separator) == typeid(char)) //unix/ mac where preferred_separator is char
        return  "/";
    else if(typeid(fs::path::preferred_separator) == typeid(wchar_t)) //windows where preferred_separator is  wchar_t
        return "\\";
    return "";
}