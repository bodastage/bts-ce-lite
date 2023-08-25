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
#ifndef __BODAHUAWEIMMLPARSER_H
#define __BODAHUAWEIMMLPARSER_H

#include <map>
#include "stack"
#include <fstream>
#include <chrono>
#include "XmlInspector/XmlInspector.hpp"
#include "spdlog/spdlog.h"
#include "bodautils.h"

using namespace std;

namespace bodastage
{
    class BodaHuaweiMMLParser
    {
        public:
            BodaHuaweiMMLParser();

            string parser_version = "1.0.0";

            string logger = "bodahuaweimmlparser";

            /**
             * This holds a map of the Managed Object Instances (MOIs) to the respective
             * csv print writers.
             * 
             * @since 1.0.0
             */
            std::map<string, ofstream> moi_print_writers;

            /**
             * 
             * @brief Track parameter with children.
             * 
             * @since 1.0.0
             */
            std::map<string, std::vector<string>> parameter_child_map;

            /**
             * @brief Tag data.
             *
             * @since 1.0.0
             * @version 1.0.0
             */
            string tag_data = "";

             /**
             * @brief Line number
             * 
             * @details Tracks line numbers 
             * 
             * @since 1.3.1
             */
            int line_number = 0;

            /**
             * Output directory.
             *
             * @since 1.0.0
             */
            string output_directory = "/tmp";

            /**
             * Parser start time. 
             * 
             * @since 1.0.
             * @version 1.0.0
             */
            string start_time = "";

            /**
             * @brief Tracks how deep a class tag is in the hierarch.
             * 
             * @since 1.0.0
             * @version 1.0.0
             */
            int class_depth = 0;

            /**
             * @brief The base file name of the file being parsed.
             * 
             * @since 1.0.0
             */
            string base_file_name = "";

            /**
             * @brief The file to be parsed.
             * 
             * @since 1.0.0
             */
            string data_file;

            /**
             * The nodename.
             * 
             * @since 1.0.0
             * @version 1.0.0
             */
            string node_name;


             /**
             * @brief The holds the parameters and corresponding values for the moi tag  
             * currently being processed.
             * 
             * @since 1.0.0
             */
            std::map<string,string> moi_parameter_value_map;

            /**
             * @brief It holds the parameters and corresponding values for the moi tag  
             * currently being processed.
             * 
             * @since 1.0.0
             * @version 1.0.0
             */
            std::map<string, std::vector<string>> class_name_attrs_map;
            
            /**
             * @brief The holds the parameters and corresponding values for the moi tag  
             * currently being processed for Modification lines
             * 
             * @since 1.0.0
             * @version 1.0.0
             */
            std::map<string, std::vector<string>> act_class_name_attrs_map;
            
            /**
             * @brief The holds the parameters and corresponding values for the moi tag  
             * currently being processed for Deactivation lines
             * 
             * @since 1.0.0
             * @version 1.0.0
             */
            std::map<string, std::vector<string>> dea_class_name_attrs_map;
            
            /**
             * @brief The holds the parameters and corresponding values for the moi tag  
             * currently being processed for Blocking lines
             * 
             * @since 1.0.0
             * @version 1.0.0
             */
            std::map<string, std::vector<string>> blk_class_name_attrs_map;
            
            /**
             * @brief The holds the parameters and corresponding values for the moi tag  
             * currently being processed for Un-initialize lines
             * 
             * @since 1.0.0
             * @version 1.0.0
             */
            std::map<string, std::vector<string>> uin_class_name_attrs_map;

            /**
             * @brief The holds the parameters and corresponding values for the moi tag  
             * currently being processed for modification lines
             * 
             * @since 1.0.0
             * @version 1.0.0
             */
            std::map<string, std::vector<string>> mod_class_name_attrs_map;
            
            /**
             * @brief The holds the parameters and corresponding values for the moi tag  
             * currently being processed for Un-block lines
             * 
             * @since 1.0.0
             * @version 1.0.0
             */
            std::map<string, std::vector<string>> ubl_class_name_attrs_map;
            
            /**
             * @brief Current className MO attribute.
             * 
             * @since 1.0.0
             * @version 1.0.0
             */
            string class_name = "";

            /**
             * @brief Current attr tag's name attribute.
             * 
             * @since 1.0.0
             * @version 1.0.0
             */
            string mo_attr_name = "";
            
            /**
             * @brief MML generation time. 
             * 
             * @since 1.0.0
             */
            string date_time = "";
            
            /**
             * @brief The bscId from which the MML was generated in the case of 2G.
             * 
             * @since 1.0.0
             */
            string bsc_id = "";
            
            /**
             * @brief The MBSC Mode 
             * 
             * @since 1,0.0
             */
            string mbsc_mode = "";
            
            /**
             * @brief version 
             * 
             * @since 1,0.0
             */
            string version = "";
            
            /**
             * @brief IP 
             * 
             * @since 1,0.0
             */
            string IP = "";

            /**
             * @brief Extract managed objects and their parameters
             */
            bool extract_parameters_only = false;
            
            /**
             * @brief Add meta fields to each MO. FILENAME, DATETIME
             */
            bool extract_meta_fields = false;

            /**
             * @brief The file/directory to be parsed.
             *
             * @since 1.1.0
             */
            string dataSource;

            /**
             * @brief Parser states. Currently there are only 2: extraction and parsing
             * 
             * @since 1.1.0
             * @version 1.0.0
             */
            int parser_state = EXTRACTING_PARAMETERS;

            string data_source = "";
            
            std::map<string, string> attr_value_map;

            /**
             * @brief File with a list of managed objects and parameters to extract.
             * 
             */
            string parameter_file;

            void set_extract_parameters_only(bool bl);
            void set_extract_meta_fields(bool bl);
            void get_parameters_to_extract(string filename);
            void process_file_or_directory();
            void process_line(string line);
            void parse_file( string input_filename );
            void parse();
            void set_parameter_file(string filename);
            void set_file_name(string filename );
            void set_data_source(string data_source );
            string to_csv_format(string s);
            void close_mo_pw_map();
            void print_execution_time();
            void set_output_directory(string directory_name);
            void extact_parameter_and_values(string line, string key_word);

    };
}

#endif //__BODAHUAWEIMMLPARSER_H