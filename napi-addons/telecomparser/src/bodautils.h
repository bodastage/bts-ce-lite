
#include <vector>
#include <string>
#include <cctype>
#include <functional>
#include <algorithm>
#include <boost/algorithm/string.hpp>

namespace fs = std::filesystem;

namespace bodastage{

    std::vector<std::string> split_str(
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


    bool file_is_readable(const fs::path& p)
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

    bool file_is_writable(const fs::path& p)
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

    bool is_directory(const fs::path& p){
        std::error_code ec; 
        if (fs::is_directory(p, ec)) return true;
        return false;
    }

    bool is_regular_file(const fs::path& p){
        std::error_code ec; 
        if (fs::is_regular_file(p, ec)) return true;
        return false;
    }

    bool starts_with(string s, string prefix){
        return (s.rfind(prefix, 0) == 0);
    }

    bool ends_with(string s, string suffix){
        return (s.rfind(suffix, s.length() - suffix.length()) == 0);
    }

    string tolower(string s){
        string s_tmp = s;
        //std::transform(s_tmp.begin(), s_tmp.end(), s_tmp.begin(), [](unsigned char c) { return std::tolower(c); });
        //return s;
        boost::algorithm::to_lower(s_tmp);

        return s_tmp;
    }

    /**
     * @brief Replace all occurrences of a string with another string.
    */
    string str_replace(string haystack, string needle, string replacement){
        string s = haystack;

        if(s.find(needle) == string::npos) return s;

        //@TODO: add while loop to replace all occurrences
        s.replace(s.find(needle), needle.length(), replacement);
        return s;
    }

    /**
     * @brief Check if a string contains another string.
    */
    bool str_contains(string haystack, string needle){
        return (haystack.find(needle) != std::string::npos);
    }

    //@TODO: use references instead of copying
    template <typename T> bool value_in_vector(std::vector<T> v, T needle){
        return std::find(v.begin(), v.end(), needle) != v.end();
    }

    /**
     * @brief Get file base name.
     *
     * @since 1.0.0
     */
    string get_file_basename(string filename) {
        return fs::path(filename).filename();
    }

}