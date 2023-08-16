#include <napi.h>
#include <iostream>
#include <map>

//Logging
#include "spdlog/spdlog.h"
#include "spdlog/cfg/env.h"  // support for loading levels from the environment variable
#include "spdlog/fmt/ostr.h" // support for user defined types

using namespace std;
namespace bodastage
{

    enum ParserStates { 
        
        //managed object parser extraction stage 
        EXTRACTING_PARAMETERS = 1, 
        
        //Parameter value extraction stage
        EXTRACTING_VALUES = 2,

        //parsing done
        EXTRACTING_DONE = 3
    };

    class BulkCMParser
    {
        public: 
            string version = "1.0.0";

            string logger = "bulkcmparser";

            /**
             * @brief Tracks XML elements
             * 
             * @since 1.0.0
            */
            vector<string> xml_tag_stack;

            /**
             * @brief Tracks how deep a managed object in is this XML hierarchy
             * 
             * @since 1.0.0
            */
           int depth = 0;

            /**
            * @brief Tracks XML attributes per managed object
            * 
            * @since 1.0.0
            */
           std::map<int, std::map<string, string>> xml_attr_stack;



    };

    /**
     * @brief parse input file or directory into output directory
     * 
     * @param input_file char* input file or directory
     * @param output_dir char* output directory
     * @param multivalue_sep char* multivalue separator. defailt is ";"
     * @param meta_fields char* meta fields. FILENAME,DATETIME
     * @param extract_parametes char* specify parameter to extract parameters. default is ""
     * @param separate_vsdata bool separate vsdata. default is false
    */
    int parse_bulkcm(string input_file, string output_dir, string multivalue_sep = ";", string meta_fields = "", string extract_parametes = "", bool separate_vsdata = false);

    // parse_bulkcm function wrapper
    /**
     * @brief
     * 
    */
    Napi::Boolean parse_bulkcm_wrapper(const Napi::CallbackInfo &info);

    // Export API
    Napi::Object Init(Napi::Env env, Napi::Object exports);

    NODE_API_MODULE(addon, Init)
}