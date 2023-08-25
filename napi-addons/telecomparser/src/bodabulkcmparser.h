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

#ifndef __BODABULKCMPARSER_H
#define __BODABULKCMPARSER_H

#include <map>
#include "stack"
#include <fstream>
#include <chrono>
#include "XmlInspector/XmlInspector.hpp"
#include "spdlog/spdlog.h"
#include "bodautils.h"

//namespace fs = std::filesystem;

using namespace std;

namespace bodastage
{

    class BodaBulkCmParser
    {
    public:
        BodaBulkCmParser();

        string version = "1.0.0";

        string logger = "bulkcmparser";

        /**
         * @brief Tracks XML elements
         * 
         * @since 1.0.0
        */
        std::vector<string> xml_tag_stack;

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

        /**
         * @brief  Managed Object specific 3GPP attributes.
         * 
         * This tracks every thing within <xn:attributes>...</xn:attributes>.
         *
         * @version 1.0.0
         * @since 1.0.0
         */
        std::map<int, std::map<string, string>> three_gpp_attr_stack;

        /**
         * @brief  start of processing per MO attributes.
         * 
         * @details  is set to true when xn:attributes is encountered. It's set to false
         * when the corresponding closing tag is encountered.
         *
         * @version 1.0.0
         * @since 1.0.0
         */
        bool attr_marker = false;

        /**
         * @brief  the depth of VsDataContainer tags in the XML document hierarchy.
         *
         * @version 1.0.0
         * @since 1.0.0
         */
        int vs_dc_depth = 0;

        /**
         * @brief  of vsDataContainer instances to vendor specific data types.
         *
         * @version 1.0.0
         * @since 1.0.0
         */
        std::map<string, string> vs_data_container_type_map;

        /**
         * @brief Tracks current vsDataType if not null
         *
         * @version 1.0.0
         * @since 1.0.0
         */
        string vs_data_type;

        /**
         * @brief vsDataTypes stack.
         *
         * @version 1.1.0
         * @since 1.0.0
         */
        std::map<string, string> vs_data_type_stack;

        /**
        * @brief Real stack to push and pop vsDataType attributes.
        * 
        * @details This is used to track multivalued attributes and attributes with children
        *
        * @version 1.0.0
        * @since 1.0.0
        */
        std::vector<string> vs_data_type_rl_stack;

        /**
         * @brief  stack to push and pop xn:attributes.
         * 
         * @details This is used to track multivalued attributes and attributes with children
         *
         * @version 1.0.0
         * @since 1.0.0
         */
        std::vector<string> xn_attr_rl_stack;

        /**
         * @brief -valued parameter separator.
         *
         * @version 1.0.0
         * @since 1.0.0
         */
        string multi_value_separetor = ";";

        /**
         * @brief For attributes with children, define parameter-child separator
         *
         * @since 1.0.0
         */
        string parent_child_attr_seperator = "_";

        /**
         * @brief Output file print writers
         *
         * @version 1.0.0
         * @since 1.0.0
         */
        std::map<string, fstream> output_file_pw;

        /**
         * @brief Output directory.
         *
         * @version 1.0.0
         * @since 1.0.0
         */
        string output_directory = "/tmp";

        /**
         * @brief Limit the number of iterations for testing.
         *
         * @version 1.0.0
         * @since 1.0.0
         */
        int test_counter = 0;

        /**
         * @brief Start element tag.
         * 
         * @details Use in the character event to determine the data parent XML tag.
         *
         * @version 1.0.0
         * @since 1.0.0
         */
        string start_element_tag = "";

        /**
         * @brief Start element NS prefix.
         *
         * @version 1.0.0
         * @since 1.0.0
         */
        string start_element_tag_prefix = "";

        /**
         * @brief Tag data.
         *
         * @version 1.0.0
         * @since 1.0.0
         */
        string tag_data = "";

        /**
         * @brief Tracking parameters with children under vsDataSomeMO.
         *
         * @version 1.0.0
         * @since 1.0.0
         */
        std::map<string, string> parent_child_parameters;

            /**
         * @brief Tracking parameters with children in xn:attributes.
         *
         * @version 1.0.0
         * @since 1.0.2
         */
        std::map<string, string> attr_parent_child_map;

        /**
         * @brief A map of MO to printwriter.
         *
         * @version 1.0.0
         * @since 1.0.0
         */
        std::map<string, ofstream> output_vs_data_type_pw_map;

        /**
         * @brief A map of 3GPP MOs to their file print writers.
         *
         * @version 1.0.0
         * @since 1.0.0
         */
        std::map<string, ofstream> output_3gpp_mo_pw_map;
        
        /**
         * @brief Bulk CM XML file name. The file we are parsing.
         */
        string bulk_cm_xml_file;

        string bulk_cm_xml_file_basename;
        
        /**
         * @brief Tracks Managed Object attributes to write to file. This is dictated by
         * the first instance of the MO found.
         *
         * @TODO: Handle this better.
         * @version 1.0.0
         * @since 1.0.0
         */
        std::map<string, std::vector<string>> mo_columns;
        
            /**
         * @brief Tracks the IDs of the parent elements
         *
         * @since 1.0.0
         */
        std::map<string, std::vector<string>> mo_columns_parent_ids;

            /**
         * @brief A map of 3GPP attributes to the 3GPP MOs
         * 
         * The 3GPP attributes are not kept in the moColumns Map object.
         * 
         * <un:UtranCell>
         *   <xn:attributes>
         *     <un:rac>0</un:rac>
         *     <un:lac>0</un:lac>
         *     ...
         *   </xn:attributes>
         * </un:UtranCell>
         *
         * @since 1.0.0
         */
        std::map<string, std::vector<string>> mo_three_gpp_attr_map;

            /**
         * @brief This stores the values of the 3GPP MO attributes to be used when combining
         * a 3GPP MO with a vendor specific MO (i.e. vsData...).
         *
         * @since 1.0.0
         */
        std::map<string, string> three_gpp_attr_values;
        
        /**
         * This is used to renamed some of the generated csv files to prevent name
         * conflict on windows where paths are case insensitive.
         */
        std::map<string, string> mo_to_file_name_map;


        /**
         * @brief The file/directory to be parsed.
         *
         * @since 1.0.0
         */
        string data_source;

        /**
         * @brief The file being parsed.
         *
         * @since 1.1.0
         */
        string data_file;

        /**
         * @brief The base file name of the file being parsed.
         *
         * @since 1.0.0
         */
        string base_file_name = "";

        string date_time = "";

        bool separate_vendor_attributes = true;

        /**
         * @brief Parser start time.
         *
         * @version 1.0.0
         * @since 1.0.0
         */
        //unsigned __int64 start_time; // = std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::system_clock::now().time_since_epoch()).count();

        ParserStates parser_state = EXTRACTING_PARAMETERS;

        /**
         * @brief Extract managed objects and their parameters
         */
        bool extract_parameters_only = false;

        /**
         * @brief Add meta fields to each MO.
         * FILENAME,DATETIME,NE_TECHNOLOGY,NE_VENDOR,NE_VERSION,NE_TYPE
         */
        bool extract_meta_fields = false;

        /**
         * parameter selection file
         */
        string parameter_file = "";

        /**
         * @brif This is used to mark when processing is still inside the children of a
         * a parameter - child scenario. It is useful when one of the children has
         * the same name as the parent.
         * <moname>
         * <chid1>someValue</child1>
         * ...
         * <moname>someValue</moname>
         * ...
         * <child/>someValue<childN>
         * </moName>
         */
        bool in_parent_child_tag = false;

        void set_extract_parameters_only(bool bl) {
            extract_parameters_only = bl;
        }

        void set_extract_meta_fields(bool bl) {
            extract_meta_fields = bl;
        }


    /**
     * @brief Get the date
     *
     * @param input_filename
     */
    void get_date_time(string input_filename);

    /**
     * @brief  parameter list from  parameter file
     *
     * @param filename
     */
    void get_parameters_to_extract(string filename);
    void parse_file(string input_filename);
    void set_parameter_file(string filename);
    void set_multi_value_separator(string mv_separator);
    void set_separate_vendor_attributes(bool separate);
    void parse();
    void process_file_or_directory();
    void set_file_name(string filename);
    void reset_variables();
    void close_mo_pw_map();
    void print_execution_time();
    void collect_mo_parameters(string input_file, string output_directory);
    int get_xml_tag_occurences(string tag_name);
    void process_3gpp_attributes();
    string to_csv_format(string s);
    void save_three_gpp_attr_values(string mo);
    void process_vendor_attributes();
    void update_three_gpp_attr_map();
    void collect_vendor_mo_columns();
    void set_data_source(string ds);
    void set_output_directory(string dir_name);
    void on_empty_element(Xml::Inspector<Xml::Encoding::Utf8Writer> &inspector);
    void on_start_document(Xml::Inspector<Xml::Encoding::Utf8Writer> &inspector);
    void on_end_document(Xml::Inspector<Xml::Encoding::Utf8Writer> &inspector);
    void on_start_element(Xml::Inspector<Xml::Encoding::Utf8Writer> &inspector);
    void on_end_element(Xml::Inspector<Xml::Encoding::Utf8Writer> &inspector);
    void on_characters(Xml::Inspector<Xml::Encoding::Utf8Writer> &inspector);
    void on_comment(Xml::Inspector<Xml::Encoding::Utf8Writer> &inspector);
    void on_error(Xml::Inspector<Xml::Encoding::Utf8Writer> &inspector);
    };

}

#endif //__BODA_BULKCMPARSER_H