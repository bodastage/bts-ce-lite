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
#ifndef __BODAHUAWEIGEXPORTPARSER_H
#define __BODAHUAWEIGEXPORTPARSER_H

#include <map>
#include "stack"
#include <fstream>
#include <chrono>
#include "XmlInspector/XmlInspector.hpp"
#include "spdlog/spdlog.h"
#include "bodautils.h"
#include <chrono>
#include <ctime>  

using namespace std;

namespace bodastage
{
    class BodaHuaweiGExportParser
    {
        public:
            BodaHuaweiGExportParser();

            string parser_version = "1.0.0";

            string logger = "bodahuaweigexportparser";

            /**
             * @brief Tracks Managed Object attributes to write to file. This is dictated by
             * the first instance of the MO found.
             *
             * @TODO: Handle this better.
             *
             * @since 1.0.0
             */
            std::map<string, std::vector<string>> mo_columns;

            /**
             *
             * @brief Track parameter with children.
             *
             * @since 1.0.0
             */
            std::map<string, std::vector<string>> parameter_child_map;

            /**
             * @brief This holds a map of the Managed Object Instances (MOIs) to the respective
             * csv print writers.
             *
             * @since 1.0.0
             */
            std::map<string, std::ofstream> moi_print_writers;

            /**
             * @brief Tag data.
             *
             * @since 1.0.0
             * @version 1.0.0
             */
            string tag_data = "";

            /**
             * This is used when subsituting a parameter value with the value indicated
             * in comments.
             *
             * @since 1.0.0
             */
            string previous_tag;

            /**
             * Output directory.
             *
             * @since 1.0.0
             */
            string output_directory = "/tmp";

            /**
             *
             * @since 1.0.0
             */
            string node_type_version = "";

            /**
             * @brief Parser start time.
             *
             * @since 1.0.4
             * @version 1.0.0
             */
            std::chrono::time_point<std::chrono::system_clock>  start_time = std::chrono::system_clock::now();

            /**
             * @brief Tracks how deep a class tag is in the hierarchy.
             *
             * @since 1.0.0
             * @version 1.0.0
             */
            int class_depth = 0;

            /**
             * @brief Tracks how deep a class tag is in the XML hierarchy.
             *
             * @since 1.0.0
             * @version 1.0.0
             */
            int object_depth = 0;

            /**
             * @brief The base file name of the file being parsed.
             *
             * @since 1.0.0
             * @version 1.0.0
             */
            string base_file_name = "";

            /**
             * @brief The file to be parsed.
             *
             * @since 1.0.0
             * @version 1.0.0
             */
            string data_file;

            /**
             * @brief File or directory
             */
            string data_source;

            /**
             * @brief The nodename.
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
             * @version 1.0.0
             */
            std::map<string, string> moi_parameter_value_map;

            /**
             * @brief The holds the parameters and corresponding values for the moi tag
             * currently being processed.
             *
             * @since 1.0.0
             * @version 1.0.0
             */
            std::map<string, string> class_name_attrs_map;
            
            //This list should be ignored when checking for switches
            std::vector<string> mo_list_without_mv_values {"GCELL", "GCELLHOINTERRATLDB", "INVENTORYBOARD", "S1INTERFACE"};
            
            /**
             * @brief ClassName tag stack.
             *
             * @version 1.0.0
             * @since 1.0.0
             */
            std::vector<string> class_name_stack;

            /**
             * @brief Current className MO attribute.
             *
             * @since 1.0.0
             * @version 1.0.0
             */
            string class_name;

            /**
             * @brief Current object tag's name attribute value.
             *
             * @since 1.0.0
             * @version 1.0.0
             */
            string mo_param_name;

            /**
             * @brief The technology value of the first object tag.
             *
             * @since 1.0.0
             * @version 1.0.0
             */
            string technology;

            /**
             * @brief The vendor value of the first object tag.
             *
             * @since 1.0.0
             * @version 1.0.0
             */
            string vendor;

            /**
             * @brief The version value of the first object tag.
             *
             * @since 1.0.0
             * @version 1.0.0
             */
            string version;

            /**
             * @brief Parameter file
             */
            string parameter_file;

            /**
             * @brief Current parameter name attribute 
             */
            string parameter_name_attr;
            
            /**
             * @brief File extraction time
             * 
             * @details This is extract as the last digits before the file extension. e.g.
             * GExport_RNCNAME_10.22.111.88_20171211060843.xml.
             * It is required that the Gexport CM dump be of the format above.
             */
            string date_time = "";

            /**
             * @brief Extract managed objects and their parameters
             */
            bool extract_parameters_only = false;
            
            
            bool separate_switches = false;
            
            /**
             * @brief Add meta fields to each MO.
             * FILENAME,DATETIME,NE_TECHNOLOGY,NE_VENDOR,NE_VERSION,NE_TYPE 
             */
            bool extract_meta_fields = false;
            
            /**
             * @brief Parsing state
             *
             */
            int parser_state = EXTRACTING_PARAMETERS;

            void set_extract_parameters_only(bool bl);
            void set_extract_meta_fields(bool bl);
            void get_parameters_to_extract(string filename);
            void reset_internal_variables();
            void set_parameter_file(string filename);
            void set_data_source(string ds);
            void process_file_or_directory();
            void parse();
            void display_mos_and_parameters();
            void parse_file(string input_filename);
            void on_start_element(Xml::Inspector<Xml::Encoding::Utf8Writer> &inspector);
            void on_characters(Xml::Inspector<Xml::Encoding::Utf8Writer> &inspector);
            void on_end_element(Xml::Inspector<Xml::Encoding::Utf8Writer> &inspector);
            void on_empty_element(Xml::Inspector<Xml::Encoding::Utf8Writer> &inspector);
            void on_comment(Xml::Inspector<Xml::Encoding::Utf8Writer> &inspector);
            void print_execution_time();
            void set_output_directory(string directory_name);
            string add_u_to_umts_cell_mos(string class_name_attr_value);
            void set_file_name(string filename);
            void close_mo_pw_map();
            void separate_individual_switches(bool b);
            
           
    };
}

#endif //__BODAHUAWEIGEXPORTPARSER_H